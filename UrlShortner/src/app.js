const express = require('express');
const config = require('./config');
const urlRoutes = require('./routes/urlRoutes');
const statsRoutes = require('./routes/statsRoutes');
const { redirectToOriginalUrl } = require('./controllers/urlController');
const { sendLog } = require('./middleware/loggingMiddleware'); 

const app = express();

// Log that we are using in-memory data
console.log('--- Running ---');
sendLog({ stack: 'backend', level: 'info', package: 'service', message: 'Application running with in-memory data store' });


// Middleware
app.use(express.json());

// API Endpoints
app.use('/', urlRoutes);
app.use('/', statsRoutes);

// Redirection Route
app.get('/:shortcode', redirectToOriginalUrl);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    sendLog({
        timestamp: new Date().toISOString(),
        stack: 'backend',
        level: 'error',
        package: 'handler',
        message: `Unhandled error: ${err.message}`,
        details: { stack: err.stack, path: req.path },
    });
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    sendLog({ stack: 'backend', level: 'info', package: 'service', message: `Server started on port ${config.port}` });
});