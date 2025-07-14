const { generateUniqueShortcode } = require('../utils/shortcodeGenerator');
const { sendLog } = require('../middleware/loggingMiddleware');
const { findUrlByShortcode, saveUrl, deleteUrlByShortcode } = require('../data/mockDatabase');

const createShortUrl = async (req, res) => {
    const { url, validity, shortcode } = req.body;

    if (!url) {
        sendLog({ stack: 'frontend', level: 'error', package: 'controller', message: 'URL is required' });
        return res.status(400).json({ error: 'URL is required.' });
    }

    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(url)) {
        sendLog({ stack: 'frontend', level: 'error', package: 'controller', message: 'Invalid URL format' });
        return res.status(400).json({ error: 'Invalid URL format.' });
    }

    try {
        let finalShortcode = shortcode;
        if (finalShortcode) {
            if (!/^[a-zA-Z0-9]{1,10}$/.test(finalShortcode)) {
                sendLog({ stack: 'frontend', level: 'error', package: 'controller', message: 'Invalid custom shortcode format' });
                return res.status(400).json({ error: 'Invalid custom shortcode. Must be alphanumeric and up to 10 characters.' });
            }
            const existingUrl = findUrlByShortcode(finalShortcode); 
            if (existingUrl) {
                sendLog({ stack: 'frontend', level: 'error', package: 'controller', message: `Shortcode collision: ${finalShortcode}` });
                return res.status(409).json({ error: 'Custom shortcode already exists. Please choose another.' });
            }
        } else {
            finalShortcode = await generateUniqueShortcode();
        }

        const createdAt = new Date();
        const expiresAt = validity ? new Date(createdAt.getTime() + validity * 60 * 1000) : new Date(createdAt.getTime() + 30 * 60 * 1000);


        const newUrlEntry = {
            originalUrl: url,
            shortcode: finalShortcode,
            createdAt: createdAt,
            expiresAt: expiresAt,
            clicks: [], 
        };

        saveUrl(newUrlEntry); 

        const shortLink = `${req.protocol}://${req.get('host')}/${finalShortcode}`;

        sendLog({ stack: 'backend', level: 'info', package: 'controller', message: `Short URL created: ${shortLink}` });
        res.status(201).json({ shortlink: shortLink, expiry: expiresAt.toISOString() });
    } catch (error) {
        console.error('Error creating short URL:', error);
        sendLog({ stack: 'backend', level: 'fatal', package: 'controller', message: `Error creating short URL: ${error.message}` });
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const redirectToOriginalUrl = async (req, res) => {
    const { shortcode } = req.params;

    try {
        const urlEntry = findUrlByShortcode(shortcode); 

        if (!urlEntry) {
            sendLog({ stack: 'frontend', level: 'warn', package: 'controller', message: `Shortcode not found: ${shortcode}` });
            return res.status(404).json({ error: 'Short URL not found.' });
        }

        if (urlEntry.expiresAt && urlEntry.expiresAt < new Date()) {
            deleteUrlByShortcode(shortcode); 
            sendLog({ stack: 'frontend', level: 'warn', package: 'controller', message: `Short URL expired: ${shortcode}` });
            return res.status(410).json({ error: 'Short URL has expired.' });
        }


        urlEntry.clicks.push({
            timestamp: new Date(),
            referrer: req.get('Referer') || 'direct',
            ipAddress: req.ip,
        });
      

        sendLog({ stack: 'backend', level: 'info', package: 'controller', message: `Redirecting ${shortcode} to ${urlEntry.originalUrl}` });
        res.redirect(urlEntry.originalUrl);
    } catch (error) {
        console.error('Error redirecting:', error);
        sendLog({ stack: 'backend', level: 'fatal', package: 'controller', message: `Error during redirection: ${error.message}` });
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    createShortUrl,
    redirectToOriginalUrl,
};