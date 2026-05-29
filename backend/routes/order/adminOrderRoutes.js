const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  getOrderStats,
  downloadOrderInvoice,
} = require('../../controllers/order/adminOrderController');
const { authenticateToken, requireRole } = require('../../middleware/auth');

// All admin order routes require an authenticated admin
router.use(authenticateToken, requireRole('admin'));

// Get order statistics
router.get('/stats', getOrderStats);

// Download order invoice PDF (must be before /:id route)
router.get('/:orderNumber/invoice/download', downloadOrderInvoice);

// Get all orders with filters
router.get('/', getAllOrders);

// Get single order by ID
router.get('/:id', getOrderById);

// Update order status
router.patch('/:id/status', updateOrderStatus);

// Update order payment status
router.patch('/:id/payment-status', updateOrderPaymentStatus);

module.exports = router;
