const { mongoose } = require('mongoose');
const { Schema, model } = mongoose;

const productsSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],
    price: {
        type: Number,
        required: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
    },
    categories: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        }
    ],
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

module.exports = model('Product', productsSchema);