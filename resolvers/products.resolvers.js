const productsModel = require('../models/products.model');

module.exports = {
    Query: {
        products: async () => {
            return await productsModel.getAllProducts();
        },
        getProductById: async (_, args) => {
            return await productsModel.getProductById(args.id);
        },
        getProductByName: async (_, args) => {
            return await productsModel.getProductByName(args.name);
        }
    },
    Mutation: {
        addNewProduct: async (_, args) => {
            return await productsModel.addNewProduct(args);
        },
        // addNewCategoryToProduct: async (_, args) => {
        //     return await productsModel.addNewCategoryToProduct(args);
        // },
        updateProductById: async (_, args) => {
            return await productsModel.updateProductById(args);
        },
        // activateDeactivateProductById: async (_, args) => {
        //     return await productsModel.activateDeactivateProductById(args.id);
        // },
        deleteProductById: async (_, args) => {
            return await productsModel.deleteProductById(args.id);
        },
        deleteCategoryById: async (_, args) => {
            return await productsModel.deleteCategoryById(args.id);
        },
    }
}