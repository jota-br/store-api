const express = require('express');
const authRouter = express.Router();

const authController = require('./auth.controller');

authRouter.post('/login', authController.httpAuthLogin);
authRouter.post('/logout', );

module.exports = authRouter;