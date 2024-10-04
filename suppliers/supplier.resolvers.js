const suppliersModel = require('./supplier.model');

module.exports = {
    Query: {
        suppliers: async () => {
            return await suppliersModel.getAllSuppliers();
        },
        getSupplierById: async (_, args) => {
            return await suppliersModel.getSupplierById(args.id);
        },
        getSupplierByName: async (_, args) => {
            return await suppliersModel.getSupplierByName(args.supplierName);
        },
    },
    Mutation: {
        addNewSupplier: async (_, args) => {
            return await suppliersModel.addNewSupplier(args);
        },
        deleteSupplierById: async (_, args) => {
            return await suppliersModel.deleteSupplierById(args.id);
        }
    }
}