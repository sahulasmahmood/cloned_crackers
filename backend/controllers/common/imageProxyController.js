const { getS3Object } = require("../../utils/common/imageProxy");

/**
 * Proxy S3 images through backend - DEPRECATED
 * GET /api/image/*
 */
const proxyImage = async (req, res) => {
  try {
    // Get the full path after /api/image/
    let key = req.path.substring(1); // Remove leading slash
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Image key is required",
      });
    }

    // Decode URL-encoded key
    key = decodeURIComponent(key);

    console.log(`📸 Proxying image request (Deprecated): ${key}`);

    // This will now throw an error as S3 support is removed
    // We try to catch it and redirect if possible, or just fail
    try {
        const s3Object = await getS3Object(key);
        // ... (unreachable now)
        s3Object.Body.pipe(res);
    } catch (e) {
        // If it looks like a Cloudinary URL, redirect?
        // But getS3Object takes a key.
        return res.status(410).json({
            success: false,
            message: "Image proxying for S3 is deprecated. Please migrate to Cloudinary.",
        });
    }

  } catch (error) {
    console.error("Error proxying image:", error);
    res.status(404).json({
      success: false,
      message: "Image not found",
      error: error.message,
    });
  }
};

module.exports = { proxyImage };
