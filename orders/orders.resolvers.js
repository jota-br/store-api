const ordersModel = require('./orders.model');

module.exports = {
    Query: {
        orders: () => {
            return ordersModel.getAllOrders();
        },
        order: (_, args) => {
            return ordersModel.getOrdersById(args.id);
        }
    },
    Mutation: {
        addNewOrder: (_, args) => {
            return ordersModel.addNewOrder(args);
        }
    }
}