const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordersSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer',
        required: true,
    },
    orderDate: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    }
});

module.exports = model('order', ordersSchema);