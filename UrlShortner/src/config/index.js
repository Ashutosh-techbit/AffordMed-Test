require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    loggingApiUrl: process.env.LOGGING_API_URL,
    authApiUrl: process.env.AUTH_API_URL, 
    authCredentials: { 
        email: process.env.AUTH_EMAIL,
        name: process.env.AUTH_NAME,
        rollNo: process.env.AUTH_ROLL_NO,
        accessCode: process.env.AUTH_ACCESS_CODE,
        clientID: process.env.AUTH_CLIENT_ID,
        clientSecret: process.env.AUTH_CLIENT_SECRET,
    }
};