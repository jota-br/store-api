const { mongoose } = require('mongoose');
const { Schema, model } = mongoose;

const usersSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
        unique: true,
    },
    salt: {
        type: String,
        required: true,
    },
    hash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: 'customer',
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
    },
    createdAt: {
        type: Number,
        required: true,
    },
});

module.exports = model('User', usersSchema);