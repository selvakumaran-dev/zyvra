const express = require('express');
const router = express.Router();
const { processChat, analyzeSentiment, parseResume } = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

router.post('/chat', auth, processChat);
router.post('/sentiment', auth, analyzeSentiment);
router.post('/parse-resume', auth, parseResume);

module.exports = router;
