const customersModel = require('../../models/customers.model');

module.exports = {
    // Query: {
    //     customers: async () => {
    //         return await customersModel.getAllCustomers();
    //     },
    //     getCustomerById: async (_, args) => {
    //         return await customersModel.getCustomerById(args.id);
    //     },
    //     getCustomerByEmail: async (_, args) => {
    //         return await customersModel.getCustomerByEmail(args.email);
    //     }
    // },
    Mutation: {
        updateCustomerById: async (_, { input }) => {
            return await customersModel.updateCustomerById(input);
        },
    }
}