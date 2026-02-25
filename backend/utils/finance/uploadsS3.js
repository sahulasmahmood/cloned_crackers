const { getProxyImageUrl } = require("../common/imageProxy");
require("dotenv").config();

// Get proxy image URL (returns backend proxy URL instead of presigned URL)
const getPresignedUrl = (key, expiresIn = 3600) => {
  // Use proxy URL instead of presigned URL (handles Cloudinary URLs too if updated)
  return getProxyImageUrl(key);
};

module.exports = { getPresignedUrl };
