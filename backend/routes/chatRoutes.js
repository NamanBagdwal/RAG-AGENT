const express = require('express');
const router = express.Router();
const { streamChat, getChatSessions, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/stream', protect, streamChat);
router.get('/sessions', protect, getChatSessions);
router.get('/sessions/:id', protect, getChatHistory);

module.exports = router;
