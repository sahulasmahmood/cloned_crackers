const express = require('express');
const {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} = require('../../controllers/online/badgeController');

const router = express.Router();

// Badge CRUD routes
router.get('/', getAllBadges);
router.post('/', createBadge);
router.put('/:id', updateBadge);
router.delete('/:id', deleteBadge);

module.exports = router;
