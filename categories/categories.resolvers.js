const categoriesModel = require('./categories.model');

module.exports = {
    Query: {
        categories: async () => {
            return await categoriesModel.getAllCategories();
        },
        getCategoryById: async (_, args) => {
            return await categoriesModel.getCategoryById(args.id);
        }
    },
    Mutation: {
        addNewCategory: async (_, args) => {
            return await categoriesModel.addNewCategory(args);
        },
        updateCategoryById: async (_, args) => {
            return await categoriesModel.updateCategoryById(args);  
        },
    }
}