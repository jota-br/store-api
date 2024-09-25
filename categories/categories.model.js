const Category = require('./categories.mongo');

async function getAllCategories() {
    try {
        return await Category.find({}, {}).exec();
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getCategoryById(id) {
    try {
        // get category with ${id} from DB
        const result = await Category.findOne({ id: Number(id) });
        // if category is found return
        if (result) {
            return result;
        }
        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getCategoryByName(name) {
    try {
        // get category with ${name} from DB
        const result = Category.findOne({ name: new RegExp(name, 'i') }, {});
        // if category is found return
        if (result) {
            return result;
        }
        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function addNewCategory(data) {
    try {
        // Count number of documents in Category collection
        const docs = await Category.countDocuments();
        // create new category object
        const newCategory = {
            id: Number(docs),
            name: data.name,
            description: data.description || null,
        }
        // Upsert (new) Category
        const result = await Category.create({
            id: newCategory.id,
            name: newCategory.name,
            description: newCategory.description || null,
        });
        // If new category was created return it's value
        if (result) {
            return newCategory;
        }
        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    addNewCategory,
}