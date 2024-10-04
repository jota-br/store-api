const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordersSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    orderDate: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Number,
        required: true,
    },
    updatedAt: {
        type: Number,
        required: false,
    }
});

module.exports = model('Order', ordersSchema);