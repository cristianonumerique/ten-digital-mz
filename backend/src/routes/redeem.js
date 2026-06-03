const express = require('express');
const router = express.Router();
const redeemController = require('../controllers/redeem');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/redeem/check', redeemController.checkCode);
router.post('/redeem', auth, redeemController.redeemCode);
router.get('/redeem/my-codes', auth, redeemController.getRedeemedCodes);
router.post('/admin/redeem-codes', auth, isAdmin, redeemController.createRedeemCodes);
router.get('/admin/redeem-codes', auth, isAdmin, redeemController.getAllRedeemCodes);

module.exports = router;
