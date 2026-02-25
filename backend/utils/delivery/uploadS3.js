const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../common/cloudinary");
const multer = require("multer");
require("dotenv").config();

console.log("Cloudinary Config (Delivery):", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files (JPEG, JPG, PNG, WEBP) are allowed"));
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
  const extname = allowedTypes.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only image files (JPEG, JPG, PNG) or PDF documents are allowed"));
};

const uploadProfilePhoto = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
});

const uploadToS3 = async (file, folder = "delivery-partners", subfolder = "") => {
  try {
    const folderPath = subfolder ? `${folder}/${subfolder}` : folder;
    const result = await uploadToCloudinary(file.buffer, folderPath);
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};

const uploadProfilePhotoToS3 = async (file, partnerId) => {
  return uploadToS3(file, "delivery-partners", `${partnerId}/profile-photo`);
};

const uploadAadharToS3 = async (file, partnerId) => {
  return uploadToS3(file, "delivery-partners", `${partnerId}/id-proofs/aadhar`);
};

const uploadLicenseToS3 = async (file, partnerId) => {
  return uploadToS3(file, "delivery-partners", `${partnerId}/id-proofs/license`);
};

const uploadVehicleRCToS3 = async (file, partnerId) => {
  return uploadToS3(file, "delivery-partners", `${partnerId}/vehicle-documents/rc`);
};

const uploadInsuranceToS3 = async (file, partnerId) => {
  return uploadToS3(file, "delivery-partners", `${partnerId}/vehicle-documents/insurance`);
};

const uploadPollutionCertToS3 = async (file, partnerId) => {
  return uploadToS3(file, "delivery-partners", `${partnerId}/vehicle-documents/pollution`);
};

const uploadIdProofToS3 = async (file, partnerId) => {
  return uploadToS3(file, "delivery-partners", `${partnerId}/id-proofs/other`);
};

const deleteFromS3 = async (fileUrl) => {
  try {
    const publicId = getPublicIdFromUrl(fileUrl);
    if (!publicId) {
       console.log("Invalid Cloudinary URL or file not found, skipping delete:", fileUrl);
       return true; // Treat as success
    }
    await deleteFromCloudinary(publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
};

const getPresignedUrl = async (key, expiresIn = 3600) => {
  return key; // Return as is for Cloudinary
};

module.exports = {
  uploadProfilePhoto,
  uploadDocument,
  uploadProfilePhotoToS3,
  uploadAadharToS3,
  uploadLicenseToS3,
  uploadVehicleRCToS3,
  uploadInsuranceToS3,
  uploadPollutionCertToS3,
  uploadIdProofToS3,
  deleteFromS3,
  getPresignedUrl,
};
