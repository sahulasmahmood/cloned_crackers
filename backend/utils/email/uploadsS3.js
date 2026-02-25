const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../common/cloudinary");
const multer = require("multer");
require("dotenv").config();

// Configure Multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|ico/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files (JPEG, PNG, SVG, ICO) are allowed"));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Upload file to Cloudinary
const uploadToS3 = async (file, folder = "web-settings") => {
  try {
    const result = await uploadToCloudinary(file.buffer, folder);
    console.log("Upload successful:", result.secure_url);
    return result.secure_url; 
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

// Generate presigned URL (Cloudinary URLs are public)
const getPresignedUrl = async (key, expiresIn = 3600) => {
  return key; // Return as-is
};

// Delete file from Cloudinary
const deleteFromS3 = async (key) => {
  try {
    const publicId = getPublicIdFromUrl(key);
    if (!publicId) {
      console.log("Invalid Cloudinary URL, skipping delete:", key);
      return;
    }
    
    console.log("Deleting from Cloudinary:", publicId);
    await deleteFromCloudinary(publicId);
    console.log("Delete successful:", publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
  }
};

module.exports = { upload, uploadToS3, getPresignedUrl, deleteFromS3 };
