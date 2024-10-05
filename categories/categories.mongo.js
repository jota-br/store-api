const { mongoose } = require('mongoose');
const { Schema, model } = mongoose;

const categoriesSchema = new Schema({
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
    }
});

module.exports = model('Category', categoriesSchema);