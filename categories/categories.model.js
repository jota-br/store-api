const Category = require('./categories.mongo');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllCategories() {
    try {
        return await Category.find({}, {}).exec();
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getCategoryById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        // get category with ${id} from DB
        const result = await Category.findOne({ id: Number(id) });
        // if category is found return
        if (result) {
            return result;
        }
        throw new Error(`Couldn\'t return category with id: ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getCategoryByName(name) {
    try {
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        // get category with ${name} from DB
        const result = Category.findOne({ name: new RegExp(name, 'i') }, {});
        // if category is found return
        if (result) {
            return result;
        }
        throw new Error(`Couldn\'t return category with name: ${name}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewCategory(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        // Count number of documents in Category collection
        const idIndex = await getNextId('categoryId');
        const date = await validations.getDate();

        // Create new Category
        const result = await Category({
            id: idIndex,
            name: data.name,
            description: data.description || null,
            createdAt: date,
        }).save();
        // If new category was created return it's value
        if (result) {
            return result;
        }
        
        throw new Error('Couldn\'t create new category...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    addNewCategory,
}