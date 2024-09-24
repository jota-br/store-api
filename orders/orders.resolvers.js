const ordersModel = require('./orders.model');

module.exports = {
    Query: {
        orders: async () => {
            return await ordersModel.getAllOrders();
        },
        order: async (_, args) => {
            return await ordersModel.getOrdersById(args.id);
        }
    },
    Mutation: {
        addNewOrder: async (_, args) => {
            return await ordersModel.addNewOrder(args);
        }
    }
}