const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

try {
    mongoose.connection.once('open', () => {
        console.log('No errors. Ready to connect to mongoDB...');
    });
} catch (err) {
    console.log({
        error: `Connection error. Something went wrong... ${err}`
    });
    throw Error(err);
}

async function mongoConnect() {
    try {
        await mongoose.connect(MONGO_URL, {});
        console.log(`Database connected successfully...`);
    } catch (err) {
        console.log({
            error: `Connection unsuccessful...`
        });
        throw Error(err);
    }
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}