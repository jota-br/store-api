const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const sequenceIdSchema = new Schema({
    _id: String,
    seq: Number,
});

const idIndex = mongoose.model('IdIndex', sequenceIdSchema);

async function getNextId(collection) {
    const index = await idIndex.findOneAndUpdate(
        { _id: collection },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
    );
    return index.seq;
}

module.exports = {
    getNextId,
}