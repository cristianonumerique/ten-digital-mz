const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/admin/stats', auth, isAdmin, adminController.getStats);
router.get('/admin/sales', auth, isAdmin, adminController.getSales);
router.get('/admin/users', auth, isAdmin, adminController.getUsers);
router.get('/admin/sales-by-category', auth, isAdmin, adminController.getSalesByCategory);
router.get('/admin/revenue-report', auth, isAdmin, adminController.getRevenueReport);

module.exports = router;
