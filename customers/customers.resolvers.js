const customersModel = require('./customers.model');

module.exports = {
    Query: {
        customers: async () => {
            return await customersModel.getAllCustomers();
        },
        customer: async (_, args) => {
            return await customersModel.getCustomersById(args.id);
        },
        getCustomersByEmail: async (_, args) => {
            return await customersModel.getCustomersByEmail(args.email);
        }
    },
    Mutation: {
        addNewCustomer: async (_, args) => {
            return await customersModel.addNewCustomer(args);
        }
    }
}