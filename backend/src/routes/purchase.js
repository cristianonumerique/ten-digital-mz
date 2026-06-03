const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase');
const { auth } = require('../middleware/auth');

router.post('/checkout', auth, purchaseController.createCheckoutSession);
router.post('/verify-payment', auth, purchaseController.verifyPayment);
router.get('/purchases', auth, purchaseController.getMyPurchases);
router.get('/purchases/:id', auth, purchaseController.getPurchase);

module.exports = router;
