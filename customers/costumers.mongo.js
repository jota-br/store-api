const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const customersSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        match: /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    createdAt: {
        type: Number,
        required: true,
    }
});

module.exports = model('Customer', customersSchema);