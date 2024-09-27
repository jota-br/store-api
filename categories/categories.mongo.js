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

module.exports = model('Category', categoriesSchema);