const Order = require('./orders.mongo');

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
        const docs = await Order.countDocuments();
        let newOrder = {
            id: Number(docs),
            orderDate: Number(data.orderDate),
            totalAmount: Number(data.totalAmount),
        }
        const result = await Order.create({
            id: newOrder.id,
            orderDate: newOrder.orderDate,
            totalAmount: newOrder.totalAmount,
        });
        if (result) {
            return newOrder;
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