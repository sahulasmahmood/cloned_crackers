const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../common/cloudinary");
const path = require("path");
const { getProxyImageUrl } = require("../common/imageProxy");

/**
 * Upload file to Cloudinary (Replaces S3)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Cloudinary Secure URL
 */
const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  try {
    const result = await uploadToCloudinary(fileBuffer, 'items');
    console.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("❌ Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

/**
 * Delete file from Cloudinary (Replaces S3)
 * @param {string} fileKeyOrUrl - Cloudinary URL
 * @returns {Promise<boolean>}
 */
const deleteFromS3 = async (fileKeyOrUrl) => {
  try {
    const publicId = getPublicIdFromUrl(fileKeyOrUrl);
    if (!publicId) {
      console.log("⚠️ Invalid Cloudinary URL or file not found, skipping delete:", fileKeyOrUrl);
      return false;
    }

    await deleteFromCloudinary(publicId);
    console.log(`✅ File deleted from Cloudinary: ${publicId}`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error);
    return false;
  }
};

/**
 * Get proxy image URL (returns backend proxy URL instead of presigned URL)
 * @param {string} key - S3 file key or full URL
 * @param {number} expiresIn - Not used anymore (kept for backward compatibility)
 * @returns {string} - Backend proxy URL
 */
const getPresignedUrl = (key, expiresIn = 3600) => {
  // Use proxy URL instead of presigned URL
  return getProxyImageUrl(key);
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getPresignedUrl,
};
