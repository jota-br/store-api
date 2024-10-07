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

module.exports = model('Supplier', suppliersSchema);