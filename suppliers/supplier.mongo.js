const { mongoose } = require('mongoose');
const { Schema, model } = mongoose;

const suppliersSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    supplierName: {
        type: String,
        required: true,
    },
    contactNames: [
        {
            type: String,
            required: false,
        }
    ],
    phones: [
        {
            type: String,
            required: false
        }
    ],
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
    },
});

module.exports = model('Supplier', suppliersSchema);