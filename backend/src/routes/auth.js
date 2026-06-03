const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { auth } = require('../middleware/auth');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);

module.exports = router;
