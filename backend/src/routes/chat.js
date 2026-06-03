const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const { auth } = require('../middleware/auth');

router.post('/chat', auth, chatController.chat);
router.post('/chat/history', auth, chatController.chatWithHistory);

module.exports = router;
