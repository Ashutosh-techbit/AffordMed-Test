const axios = require('axios');
const config = require('../config');

let currentAccessToken = null;
let tokenExpiryTime = 0; 


const getAccessToken = async () => {
    
    if (currentAccessToken && Date.now() < tokenExpiryTime - (5 * 60 * 1000)) {
        return currentAccessToken;
    }

    console.log('Attempting to obtain a new access token...');
    try {
        const response = await axios.post(config.authApiUrl, config.authCredentials, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { access_token, expires_in, token_type } = response.data;
        if (token_type.toLowerCase() === 'bearer' && access_token) {
            currentAccessToken = access_token;
          
            tokenExpiryTime = Date.now() + (expires_in * 1000);
            console.log('Access token obtained successfully.');
            return currentAccessToken;
        } else {
            throw new Error('Invalid token response from authentication API.');
        }
    } catch (error) {
        console.error('Failed to obtain access token:', error.message);
        if (error.response) {
            console.error('Auth API Response Status:', error.response.status);
            console.error('Auth API Response Data:', error.response.data);
        }
        currentAccessToken = null; 
        tokenExpiryTime = 0;
        throw new Error('Authentication failed: Could not get access token.');
    }
};

const sendLog = async (logData) => {
    try {
        const token = await getAccessToken(); 
        if (!token) {
            console.error('No access token available to send logs.');
            return;
        }

        await axios.post(config.loggingApiUrl, logData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
    } catch (error) {
        console.error('Failed to send log to external API:', error.message);
        if (error.response) {
            console.error('Logging API Response Status:', error.response.status);
            console.error('Logging API Response Data:', error.response.data);
           
            if (error.response.status === 401) {
                console.warn('Received 401 from logging API. Invalidating token for refresh.');
                currentAccessToken = null;
                tokenExpiryTime = 0;
            }
        }
    }
};

const loggingMiddleware = (stack, level, packageName) => (req, res, next) => {
    
    const oldJson = res.json;
    res.json = function(data) {
       
        if (res.statusCode >= 200 && res.statusCode < 300) {
            const logData = {
                timestamp: new Date().toISOString(),
                stack: stack.toLowerCase(),
                level: level.toLowerCase(),
                package: packageName.toLowerCase(),
                message: `API Call: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
                details: {
                    requestBody: req.body,
                    responseBody: data, 
                    headers: req.headers,
                    ip: req.ip,
                },
            };
            sendLog(logData);
        }
        oldJson.call(res, data); 
    };

    const oldEnd = res.end;
    res.end = function(chunk, encoding) {
       
        if (res.statusCode === 302 || res.statusCode === 404 || res.statusCode === 410) {
            const logData = {
                timestamp: new Date().toISOString(),
                stack: stack.toLowerCase(),
                level: level.toLowerCase(),
                package: packageName.toLowerCase(),
                message: `API Call: ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
                details: {
                    requestBody: req.body,
                    headers: req.headers,
                    ip: req.ip,
                   
                },
            };
            sendLog(logData);
        }
        oldEnd.call(res, chunk, encoding);
    };

    next();
};

module.exports = {
    sendLog, 
    loggingMiddleware,
    getAccessToken, 
};


(async () => {
    try {
        await getAccessToken();
    } catch (error) {
        console.error("Initial token fetch failed, logs might not be sent until a successful token acquisition:", error.message);
    }
})();