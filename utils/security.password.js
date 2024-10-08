const { createHmac } = require('node:crypto');
var randomBytes = require('randombytes');

const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY; // Use a secure and unique key

async function hashPassword(password, saltKey) {
    return await new Promise((resolve) => {
        setImmediate(() => {
            const salt = saltKey || Buffer.from(randomBytes(32)).toString('hex');
            const hmac = createHmac('sha512', salt);
            hmac.update(password);
            const hash = hmac.digest('hex');
            resolve({hash, salt});
        });
    });
}

async function verifyPassword(password, salt, storedHash) {
    const result = await hashPassword(password, salt);
    return (result.hash === storedHash);
}

async function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    // Token generation
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    return token;
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
}