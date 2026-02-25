const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Folder name in Cloudinary
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'ecommerce', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @returns {Promise<Object>} - Cloudinary destroy result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Example: https://res.cloudinary.com/demo/image/upload/v1570979139/folder/sample.jpg
  // Public ID: folder/sample
  
  try {
    const parts = url.split('/');
    const lastPart = parts.pop();
    const publicIdWithExtension = lastPart.split('.')[0];
    const folderPath = parts.slice(parts.indexOf('upload') + 2).join('/'); // +2 to skip 'upload' and version
    
    // If version is present (v1234567890), it's nicely handled by excluding it?
    // Actually, simple regex might be safer or just looking for 'upload/'
    
    // Simpler approach:
    // 1. Split by 'upload/'
    // 2. Take the second part
    // 3. Remove version (e.g., v1234567890/) if present
    // 4. Remove extension
    
    const splitUrl = url.split('/upload/');
    if (splitUrl.length < 2) return null;
    
    let path = splitUrl[1];
    // Remove version if it exists (starts with v followed by numbers then slash)
    path = path.replace(/^v\d+\//, '');
    
    // Remove extension
    const publicId = path.split('.').slice(0, -1).join('.');
    
    return publicId;
  } catch (e) {
    console.error('Error extracting public ID:', e);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl
};
