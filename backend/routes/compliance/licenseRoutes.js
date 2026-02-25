const express = require('express');
const router = express.Router();
const licenseController = require('../../controllers/compliance/licenseController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// All compliance routes require Admin role
router.use(authenticateToken, requireRole('admin'));

router.post('/', licenseController.createLicense);
router.get('/', licenseController.getLicenses);
router.patch('/:id', licenseController.updateLicense);
router.delete('/:id', licenseController.deleteLicense);

module.exports = router;
