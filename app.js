const cors = require('cors');
const express = require('express');

const authRouter = require('./controllers/auth.routes');

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
app.use(express.json());

app.use('/auth', authRouter);

module.exports = { 
    app,
};