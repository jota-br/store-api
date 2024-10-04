const ordersModel = require('./orders.model');

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
        addNewOrder: async (_, args) => {
            return await ordersModel.addNewOrder(args);
        }
    }
}