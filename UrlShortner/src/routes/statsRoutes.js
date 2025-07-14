const express = require('express');
const { getShortUrlStats } = require('../controllers/statsController');
const { loggingMiddleware } = require('../middleware/loggingMiddleware');
const router = express.Router();


router.get('/shorturls/:shortcode', loggingMiddleware('backend', 'info', 'controller'), getShortUrlStats);

module.exports = router;