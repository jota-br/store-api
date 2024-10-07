const { mongoose } = require('mongoose');
const { Schema, model } = mongoose;

const usersSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
        unique: true,
    },
    salt: {
        type: String,
        required: true,
    },
    hash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: 'customer',
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
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
const User = model('User', usersSchema);

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
const Supplier = model('Supplier', suppliersSchema);

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
const Review = model('Review', reviewsSchema);

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
const Product = model('Product', productsSchema);

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
const Order = model('Order', ordersSchema);

const customersSchema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        match: /^[\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
    },
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
const Customer = model('Customer', customersSchema);

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
const Category = model('Category', categoriesSchema);

module.exports = {
    User,
    Order,
    Review,
    Product,
    Customer,
    Supplier,
    Category,
}