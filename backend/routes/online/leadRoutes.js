const express = require('express');
const router = express.Router();
const leadController = require('../../controllers/online/leadController');
const { authenticateToken, requireRole, optionalAuth } = require('../../middleware/auth');

// Public routes (with optional auth to capture userId)
router.post('/', optionalAuth, leadController.createLead);

// Protected routes
router.get('/', authenticateToken, leadController.getLeads);
router.get('/:id', authenticateToken, leadController.getLeadById);

// Admin only routes
router.patch('/:id', authenticateToken, requireRole('admin'), leadController.updateLead);
router.post('/:id/convert', authenticateToken, requireRole('admin'), leadController.convertToOrder);

module.exports = router;
