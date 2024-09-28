const Order = require('./orders.mongo');
const Customer = require('../customers/costumers.mongo');

const productsModel = require('../products/products.model');
const customersModel = require('../customers/customers.model');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllOrders() {
    try {
        return await Order.find({}, {}).populate('customer').exec();
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getOrdersById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Order.findOne({ id: Number(id) });
        if (result) {
            return result.populate('customer');
        }

        throw new Error(`Couldn\'t return order with id: ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewOrder(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        // get customer Object ID
        const customerObject = await customersModel.getCustomersById(data.customer);
        if (!customerObject) {
            throw new Error('Ivalid Customer ID...');
        }

        // get product Object ID
        const productObject = await productsModel.getProductsById(data.product);
        if (!productObject) {
            throw new Error('Invalid Product ID...');
        }
        
        // Get unique ID
        const idIndex = await getNextId('orderId');
        const date = await validations.getDate();

        // set new order to save
        const result = await Order({
            id: Number(idIndex),
            customer: customerObject._id,
            product: productObject._id,
            quantity: data.quantity,
            unitPrice: productObject.price,
            totalAmount: (productObject.price * data.quantity),
            orderDate: data.orderDate,
            createdAt: date,
        }).save();

        // if new order is saved return
        if (result) {
            // populate new Order with customer data
            await result.populate('customer');
            await result.populate('product');
            return result;
        }
        throw new Error('Couldn\'t create new order...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    getAllOrders,
    getOrdersById,
    addNewOrder,
}