const helpers = require("../utils/helpers");
const functionTace = require("../utils/logger");

const User = require('./users.model');
const security = require("../utils/security.password");
const session = require('express-session');

async function authLogin(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);

        const userExists = await User.findOne({ email: data.email }, 'id salt hash role');

        if (!userExists) {
            throw new Error('User not found...');
        }

        const validCredential = security.verifyPassword(data.password, userExists.salt, userExists.hash);

        if (!validCredential) {
            throw new Error('Invalid credential...');
        }

        const tokenData = { email: data.email, id: userExists.id, role: userExists.role };
        const token = await security.generateToken(tokenData);

        if (!token) {
            throw new Error('Invalid token...');
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('authLogin', null, execTime);

        return {
            success: true,
            message: `User logged-in...`,
            body: [{ token: token }],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('authLogin', null, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

module.exports = {
    authLogin,
}