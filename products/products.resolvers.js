const productsModel = require('./products.model');

module.exports = {
    Query: {
        products: async () => {
            return await productsModel.getAllProducts();
        },
        product: async (_, args) => {
            return await productsModel.getProductsById(args.id);
        },
        getProductsByName: async (_, args) => {
            return await productsModel.getProductsByName(args.name);
        }
    },
    Mutation: {
        addNewProduct: async (_, args) => {
            return await productsModel.addNewProduct(args);
        }
    }
}