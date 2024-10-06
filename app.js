const cors = require('cors');
const express = require('express');
const cookieSession = require('cookie-session');

require('dotenv').config();

const config = {
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2,
}

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
let i = 0;
const app = express();
// app.use(cors());
app.use(express.json());
app.use(cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
}));

module.exports = { 
    app,
};