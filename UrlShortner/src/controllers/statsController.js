const { sendLog } = require('../middleware/loggingMiddleware');
const { findUrlByShortcode } = require('../data/mockDatabase'); 

const getShortUrlStats = async (req, res) => {
    const { shortcode } = req.params;

    try {
        const urlEntry = findUrlByShortcode(shortcode);

        if (!urlEntry) {
            sendLog({ stack: 'frontend', level: 'warn', package: 'controller', message: `Stats request for non-existent shortcode: ${shortcode}` });
            return res.status(404).json({ error: 'Short URL not found.' });
        }

        sendLog({ stack: 'backend', level: 'info', package: 'controller', message: `Retrieving stats for shortcode: ${shortcode}` });
        res.status(200).json({
            shortcode: urlEntry.shortcode,
            originalUrl: urlEntry.originalUrl,
            createdAt: urlEntry.createdAt,
            expiresAt: urlEntry.expiresAt,
            totalClicks: urlEntry.clicks.length,
            clickDetails: urlEntry.clicks,
        });
    } catch (error) {
        console.error('Error retrieving short URL stats:', error);
        sendLog({ stack: 'backend', level: 'fatal', package: 'controller', message: `Error retrieving stats: ${error.message}` });
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    getShortUrlStats,
};