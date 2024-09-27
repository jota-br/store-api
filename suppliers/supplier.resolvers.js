const suppliersModel = require('./supplier.model');

module.exports = {
    Query: {
        suppliers: async () => {
            return await suppliersModel.getAllSuppliers();
        },
        supplier: async (_, args) => {
            return await suppliersModel.getSuppliersById(args.id);
        },
        getSuppliersByName: async (_, args) => {
            return await suppliersModel.getSuppliersByName(args.supplierName);
        },
    },
    Mutation: {
        addNewSupplier: async (_, args) => {
            return await suppliersModel.addNewSupplier(args);
        }
    }
}