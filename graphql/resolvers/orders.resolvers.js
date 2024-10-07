const ordersModel = require('../../models/orders.model');

module.exports = {
    Query: {
        orders: async () => {
            return await ordersModel.getAllOrders();
        },
        getOrderById: async (_, args) => {
            return await ordersModel.getOrderById(args.id);
        }
    },
    Mutation: {
        addNewOrder: async (_, { productsInput, customer }) => {
            return await ordersModel.addNewOrder(productsInput, customer);
        },
        cancelOrderById: async (_, args) => {
            return await ordersModel.cancelOrderById(args.id);
        },
    }
}