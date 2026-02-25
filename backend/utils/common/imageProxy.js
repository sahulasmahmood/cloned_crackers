require("dotenv").config();

/**
 * Convert S3 key to image proxy URL or return Cloudinary URL as is
 * @param {string} key - S3 file key or full URL
 * @returns {string|null} - Image proxy URL (/image/...) or full URL
 */
const getProxyImageUrl = (key) => {
  if (!key) return null;
   
  // If already a proxy URL, return as-is
  if (key.startsWith('/image/')) {
    return key;
  }
  
  // If it's a full URL (S3 or Cloudinary), return as-is
  // Cloudinary URLs are public and don't need proxying
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key; 
  }
  
  // Return proxy URL path (ready for Next.js Image component) for legacy S3 keys
  // Note: This might not work if S3 SDK is removed and proxy controller fails
  return `/image/${key}`;
};

/**
 * Get S3 object for streaming
 * @deprecated S3 support is removed in favor of Cloudinary
 */
const getS3Object = async (key) => {
  throw new Error("S3 support has been removed. Please use Cloudinary URLs.");
};

module.exports = { 
  getProxyImageUrl, 
  getS3Object 
};
