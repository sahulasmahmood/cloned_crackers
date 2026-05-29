const express = require('express');
const multer = require('multer');
const router = express.Router();
const licenseController = require('../../controllers/compliance/licenseController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// In-memory upload for license documents (PDF or image), max 5MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|jpeg|jpg|png|webp/;
        const okType = allowed.test(file.mimetype);
        const okExt = allowed.test(file.originalname.toLowerCase());
        if (okType || okExt) return cb(null, true);
        cb(new Error('Only PDF or image files (PDF, JPG, PNG, WEBP) are allowed'));
    }
});

// All compliance routes require Admin role
router.use(authenticateToken, requireRole('admin'));

router.post('/upload', upload.single('document'), licenseController.uploadLicenseDocument);
router.post('/', licenseController.createLicense);
router.get('/', licenseController.getLicenses);
router.patch('/:id', licenseController.updateLicense);
router.delete('/:id', licenseController.deleteLicense);

module.exports = router;
