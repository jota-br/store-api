const { mongoose } = require('mongoose');
const { Schema, model } = mongoose;

const productSchema = new Schema({
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
            review: {
                type: Schema.Types.ObjectId,
                ref: 'Category',
            }
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
            category: {
                type: Schema.Types.ObjectId,
                ref: 'Category',
            }
        }
    ],
    active: {
        type: Boolean,
        required: true,
        default: true,
    }
});

module.exports = model('product', productSchema);