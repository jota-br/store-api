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

module.exports = model('Product', productsSchema);