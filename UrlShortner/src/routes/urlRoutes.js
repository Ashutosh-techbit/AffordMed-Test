const express = require('express');
const { createShortUrl } = require('../controllers/urlController');
const { loggingMiddleware } = require('../middleware/loggingMiddleware');
const router = express.Router();


router.post('/shorturls', loggingMiddleware('backend', 'info', 'controller'), createShortUrl);

module.exports = router;