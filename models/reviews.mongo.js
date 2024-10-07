const { mongoose } = require('mongoose');
const { Schema, model } = mongoose;

const reviewsSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
    },
    rating: {
        type: Number,
        required: true,
    },
    comment: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Number,
        required: true,
    },
    updatedAt: {
        type: Number,
        required: false,
    },
    deleted: {
        type: Boolean,
        required: true,
        default: false,
    },
});

module.exports = model('Review', reviewsSchema);