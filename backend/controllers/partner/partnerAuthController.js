const { prisma } = require("../../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail: sendSMTPEmail, sendEmailWithEnv } = require("../../config/connectSMTP");

/**
 * Partner Login
 */
const partnerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find partner
    const partner = await prisma.deliveryPartner.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!partner) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if partner is approved
    if (partner.applicationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your application is not yet approved",
      });
    }

    // Check if partner is suspended
    if (partner.partnerStatus === "suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // Check if partner is inactive
    if (partner.partnerStatus === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, partner.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!partner.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        requiresVerification: true,
      });
    }

    // Update last login
    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: partner.id,
        partnerId: partner.partnerId,
        email: partner.email,
        role: "delivery_partner",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        partner: {
          id: partner.id,
          partnerId: partner.partnerId,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          partnerStatus: partner.partnerStatus,
          isEmailVerified: partner.isEmailVerified,
        },
      },
    });
  } catch (error) {
    console.error("Partner login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

/**
 * Verify Partner Email
 */
const verifyPartnerEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Find partner with this token
    const partner = await prisma.deliveryPartner.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!partner) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Update partner
    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
      },
    });

    res.json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

/**
 * Change Partner Password
 */
const changePartnerPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const partnerId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    // Get partner
    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, partner.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.deliveryPartner.update({
      where: { id: partnerId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

/**
 * Get Partner Profile
 */
const getPartnerProfile = async (req, res) => {
  try {
    const partnerId = req.user.id; // From auth middleware

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        partnerId: true,
        name: true,
        email: true,
        phone: true,
        applicationStatus: true,
        partnerStatus: true,
        isEmailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Exclude sensitive data
        password: false,
        emailVerificationToken: false,
        resetToken: false,
      },
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

/**
 * Request Password Reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if email exists (security best practice)
    if (!partner) {
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL}/partner/reset-password?token=${resetToken}`;
    const emailData = {
      to: email,
      subject: "Reset Your Password - Delivery Partner Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${partner.name},</p>
          <p>You requested to reset your password for your delivery partner account. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send email (non-blocking)
    setImmediate(async () => {
      try {
        // Get active email configuration from database
        const emailConfig = await prisma.emailConfiguration.findFirst({
          where: { isActive: true }
        });

        if (emailConfig) {
          await sendSMTPEmail(emailConfig, emailData);
        } else {
          await sendEmailWithEnv(emailData);
        }
        console.log(`✅ Password reset email sent to: ${email}`);
      } catch (err) {
        console.error("Failed to send password reset email:", err);
      }
    });

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
      error: error.message,
    });
  }
};

/**
 * Reset Password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Find partner with valid token
    const partner = await prisma.deliveryPartner.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!partner) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

module.exports = {
  partnerLogin,
  verifyPartnerEmail,
  changePartnerPassword,
  getPartnerProfile,
  requestPasswordReset,
  resetPassword,
};
