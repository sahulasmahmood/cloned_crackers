const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../common/cloudinary");
const multer = require("multer");
const { getProxyImageUrl } = require("../common/imageProxy");
require("dotenv").config();

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only documents and images are allowed"));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: fileFilter,
});

// Upload file to Cloudinary
const uploadToS3 = async (file, folder = "purchase") => {
  try {
    const result = await uploadToCloudinary(file.buffer, folder);
    console.log("✅ Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("❌ Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

// Get proxy image URL (returns backend proxy URL instead of presigned URL)
const getPresignedUrl = (key, expiresIn = 3600) => {
  // Use proxy URL handling - if it's a Cloudinary URL, it will be returned as is
  return getProxyImageUrl(key);
};

// Delete file from Cloudinary
const deleteFromS3 = async (key) => {
  try {
    const publicId = getPublicIdFromUrl(key);
    if (!publicId) {
      console.log("⚠️ Invalid Cloudinary URL, skipping delete:", key);
      return;
    }
    
    await deleteFromCloudinary(publicId);
    console.log("✅ Delete successful:", publicId);
  } catch (error) {
    console.error("❌ Error deleting from Cloudinary:", error);
  }
};

module.exports = { upload, uploadToS3, getPresignedUrl, deleteFromS3 };
