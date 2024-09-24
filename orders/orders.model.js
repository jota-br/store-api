const Order = require('./orders.mongo');
const Customer = require('../customers/costumers.mongo');

async function getAllOrders() {
    try {
        return await Order.find({}, {}).exec();
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getOrdersById(id) {
    try {
        const result = await Order.findOne({ id: Number(id) });
        if (result) {
            return result;
        }
        throw new Error('Something went wrong....');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function addNewOrder(data) {
    try {
        // Count the number of documents in orders collection
        const docs = await Order.countDocuments();
        // get customer Object ID (MongoDB id) by id
        const customerIdObj = await Customer.findOne({ id: Number(data.customer) }, { _id: 1 });

        // set new order to save
        const result = await Order({
            id: Number(docs),
            orderDate: (data.orderDate),
            totalAmount: (data.totalAmount),
            customer: customerIdObj,
        }).save();

        // if new order is saved return
        if (result) {
            // populate new Order with customer data
            return result.populate('customer');
        }
        throw new Error('Something went wrong....');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

module.exports = {
    getAllOrders,
    getOrdersById,
    addNewOrder,
}