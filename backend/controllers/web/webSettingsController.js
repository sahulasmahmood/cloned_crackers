const { prisma } = require("../../config/database");
const { uploadToS3, getPresignedUrl, deleteFromS3 } = require("../../utils/web/uploadsS3");

// Get current web settings
const getWebSettings = async (req, res) => {
  try {
    let settings = await prisma.webSettings.findFirst();
    
    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.webSettings.create({
        data: {},
      });
    }

    // Cloudinary secure URLs are public and CORS-safe, so serve them directly
    // instead of proxying through the backend (the old S3 proxy is no longer supported).
    // Append a version param (from updatedAt) to bust caches when the asset changes.
    const version = settings.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now();

    const withVersion = (url) => {
      if (!url) return null;
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}v=${version}`;
    };

    const logoUrl = withVersion(settings.logoUrl);
    const faviconUrl = withVersion(settings.faviconUrl);

    const response = {
      id: settings.id,
      logoUrl, // Direct Cloudinary URL with cache-busting version
      faviconUrl, // Direct Cloudinary URL with cache-busting version
      logoKey: settings.logoUrl, // Stored Cloudinary URL
      faviconKey: settings.faviconUrl, // Stored Cloudinary URL
      updatedAt: settings.updatedAt,
      createdAt: settings.createdAt,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching web settings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch web settings",
      message: error.message,
    });
  }
};

// Upload logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Get current settings
    let settings = await prisma.webSettings.findFirst();
    
    // Delete old logo from S3 if exists
    if (settings?.logoUrl) {
      await deleteFromS3(settings.logoUrl);
    }

    // Upload new logo to S3 - returns only the key/path
    const logoKey = await uploadToS3(req.file, "web-settings/logos");

    // Update or create settings - store only the key
    if (settings) {
      settings = await prisma.webSettings.update({
        where: { id: settings.id },
        data: { logoUrl: logoKey },
      });
    } else {
      settings = await prisma.webSettings.create({
        data: { logoUrl: logoKey },
      });
    }

    // Generate proxy URL for response
    const logoProxyUrl = getPresignedUrl(logoKey);

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      data: {
        logoUrl: logoProxyUrl, // Proxy URL for immediate use
        logoKey: logoKey, // S3 key stored in database
      },
    });
  } catch (error) {
    console.error("Error uploading logo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload logo",
      message: error.message,
    });
  }
};

// Upload favicon
const uploadFavicon = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Get current settings
    let settings = await prisma.webSettings.findFirst();
    
    // Delete old favicon from S3 if exists
    if (settings?.faviconUrl) {
      await deleteFromS3(settings.faviconUrl);
    }

    // Upload new favicon to S3 - returns only the key/path
    const faviconKey = await uploadToS3(req.file, "web-settings/favicons");

    // Update or create settings - store only the key
    if (settings) {
      settings = await prisma.webSettings.update({
        where: { id: settings.id },
        data: { faviconUrl: faviconKey },
      });
    } else {
      settings = await prisma.webSettings.create({
        data: { faviconUrl: faviconKey },
      });
    }

    // Generate proxy URL for response
    const faviconProxyUrl = getPresignedUrl(faviconKey);

    res.json({
      success: true,
      message: "Favicon uploaded successfully",
      data: {
        faviconUrl: faviconProxyUrl, // Proxy URL for immediate use
        faviconKey: faviconKey, // S3 key stored in database
      },
    });
  } catch (error) {
    console.error("Error uploading favicon:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload favicon",
      message: error.message,
    });
  }
};

// Delete logo
const deleteLogo = async (req, res) => {
  try {
    const settings = await prisma.webSettings.findFirst();
    
    if (!settings || !settings.logoUrl) {
      return res.status(404).json({
        success: false,
        error: "No logo found",
      });
    }

    // Delete from S3
    await deleteFromS3(settings.logoUrl);

    // Update settings
    await prisma.webSettings.update({
      where: { id: settings.id },
      data: { logoUrl: null },
    });

    res.json({
      success: true,
      message: "Logo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting logo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete logo",
      message: error.message,
    });
  }
};

// Delete favicon
const deleteFavicon = async (req, res) => {
  try {
    const settings = await prisma.webSettings.findFirst();
    
    if (!settings || !settings.faviconUrl) {
      return res.status(404).json({
        success: false,
        error: "No favicon found",
      });
    }

    // Delete from S3
    await deleteFromS3(settings.faviconUrl);

    // Update settings
    await prisma.webSettings.update({
      where: { id: settings.id },
      data: { faviconUrl: null },
    });

    res.json({
      success: true,
      message: "Favicon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting favicon:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete favicon",
      message: error.message,
    });
  }
};

/**
 * Legacy logo proxy endpoint.
 * Cloudinary URLs are public, so we no longer stream the image through the
 * backend (the old S3 streaming is removed). This redirects any cached proxy
 * URLs to the actual Cloudinary asset so old links keep working.
 */
const proxyLogo = async (req, res) => {
  try {
    const settings = await prisma.webSettings.findFirst();

    if (!settings || !settings.logoUrl) {
      return res.status(404).json({
        success: false,
        error: "Logo not found",
      });
    }

    // Redirect to the public Cloudinary URL directly
    return res.redirect(302, settings.logoUrl);
  } catch (error) {
    console.error("Error proxying logo:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch logo",
    });
  }
};

/**
 * Legacy favicon proxy endpoint.
 * Redirects any cached proxy URLs to the actual Cloudinary asset.
 */
const proxyFavicon = async (req, res) => {
  try {
    const settings = await prisma.webSettings.findFirst();

    if (!settings || !settings.faviconUrl) {
      return res.status(404).json({
        success: false,
        error: "Favicon not found",
      });
    }

    // Redirect to the public Cloudinary URL directly
    return res.redirect(302, settings.faviconUrl);
  } catch (error) {
    console.error("Error proxying favicon:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch favicon",
    });
  }
};

module.exports = {
  getWebSettings,
  uploadLogo,
  uploadFavicon,
  deleteLogo,
  deleteFavicon,
  proxyLogo,
  proxyFavicon,
};
