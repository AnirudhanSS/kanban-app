// src/config/index.js
require('dotenv').config();


module.exports = {
PORT: process.env.PORT || 5000,
DB: {
DB_NAME: process.env.DB_NAME,
DB_USER: process.env.DB_USER,
DB_PASSWORD: process.env.DB_PASSWORD,
DB_HOST: process.env.DB_HOST,
DB_PORT: process.env.DB_PORT || 5432,
},
REDIS: {
URL: process.env.REDIS_URL,
PASSWORD: process.env.REDIS_PASSWORD,
},
SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
};