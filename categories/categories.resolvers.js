const categoriesModel = require('./categories.model');

module.exports = {
    Query: {
        categories: async () => {
            return await categoriesModel.getAllCategories();
        },
        category: async (_, args) => {
            return await categoriesModel.getCategoryById();
        }
    },
    Mutation: {
        addNewCategory: async (_, args) => {
            return await categoriesModel.addNewCategory(args);
        }
    }
}