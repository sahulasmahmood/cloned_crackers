const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../common/cloudinary");
const multer = require("multer");
const { getProxyImageUrl } = require("../common/imageProxy");
require("dotenv").config();

// Configure Multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files (JPEG, JPG, PNG, WEBP, GIF) are allowed"));
};

// Multer upload configuration for images
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: imageFilter,
});

// Upload file to Cloudinary (replaces S3)
const uploadToS3 = async (buffer, originalname, mimetype) => {
  try {
    const result = await uploadToCloudinary(buffer, 'online');
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};

// Delete file from Cloudinary
const deleteFromS3 = async (fileUrl) => {
  try {
    const publicId = getPublicIdFromUrl(fileUrl);
    if (!publicId) {
      console.log("Invalid Cloudinary URL or file not found, skipping delete:", fileUrl);
      return false;
    }
    await deleteFromCloudinary(publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};

// Get proxy image URL (returns backend proxy URL instead of presigned URL)
const getPresignedUrl = (key, expiresIn = 3600) => {
  // Use proxy URL handling - if it's a Cloudinary URL, it will be returned as is
  return getProxyImageUrl(key);
};

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3,
  getPresignedUrl,
  // Export s3Client as null or mock if strictly required by consumers, but better to remove if possible
  s3Client: {}, 
};
