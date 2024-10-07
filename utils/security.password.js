const { createHmac } = require('node:crypto');
var randomBytes = require('randombytes');

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

module.exports = {
    hashPassword,
    verifyPassword,
}