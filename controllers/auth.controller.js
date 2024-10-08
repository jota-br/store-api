const helpers = require("../utils/helpers");
const functionTace = require("../utils/logger");

const authModel = require('../models/auth.model');

async function httpAuthLogin(req, res) {
    try {
        const startTime = await functionTace.executionTime(false, false);

        const result = await authModel.authLogin(req.body);

        if (!result.success) {
            throw new Error('Login failed...');
        }

        req.session.token = result.body[0].token;

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit(execTime);

        return res.status(200).json({ success: true, message: 'Authenticated', body: [{ token: req.session.token } ]});
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return res.status(400).json(returnError);
    }
}

module.exports = {
    httpAuthLogin,
}