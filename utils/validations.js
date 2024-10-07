const { DateTime } = require('luxon');

async function validateString(data) {
    return new Promise((resolve) => {
        setImmediate(() => {
            let regex = /\$/g;
            let arr = Object.values(data);
            let matches = arr.filter(value => typeof value === 'string' && regex.test(value));
            resolve(matches.length === 0);
        });
    });
}

async function validateEmail(email) {
    return new Promise((resolve) => {
        const emailRegex = /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/; 
        let isValid = emailRegex.test(email);
        resolve(isValid);
    })
}

async function getDate() {
    return DateTime.now().setZone("UTC-3").toUnixInteger();
}

module.exports = {
    validateString,
    validateEmail,
    getDate,
}