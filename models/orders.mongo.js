const { mongoose } = require('mongoose');
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
    products: [{
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
    }],
    totalOrderAmount: {
        type: Number,
        required: true,
    },
    orderDate: {
        type: Number,
        required: true,
    },
    delivered: {
        type: Boolean,
        required: false,
        default: false,
    },
    deliveryDate: {
        type: Number,
        required: false,
    },
    updatedAt: {
        type: Number,
        required: false,
    },
    canceled: {
        type: Boolean,
        required: false,
        default: false,
    }
});

module.exports = model('Order', ordersSchema);