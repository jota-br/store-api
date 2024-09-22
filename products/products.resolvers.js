const productsModel = require('./products.model');

module.exports = {
    Query: {
        products: () => {
            return productsModel.getAllProducts();
        },
        product: (_, args) => {
            return productsModel.getProductsById(args.id);
        },
        getProductsByName: (_, args) => {
            return productsModel.getProductsByName(args.name);
        }
    },
    Mutation: {
        addNewProduct: (_, args) => {
            return productsModel.addNewProduct(args);
        }
    }
}