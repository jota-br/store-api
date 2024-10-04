const Category = require('./categories.mongo');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllCategories() {
    try {
        const result = await Category.find({}, {}).exec();
        if (result) {
            return {
                success: true,
                message: `Fetched all Categories...`,
                body: result,
            };
        }
        throw new Error(`Couldn\'t find Categories...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
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
            return {
                success: true,
                message: `Category with ID ${id} found...`,
                body: [result],
            };  
        }
        throw new Error(`Couldn\'t return category with ID ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getCategoryByName(name) {
    try {
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        // get category with ${name} from DB
        const result = Category.findOne({ name: new RegExp(`^${name}^`, 'i') }, {});
        // if category is found return
        if (result) {
            return {
                success: true,
                message: `Category with NAME ${name} found...`,
                body: [result],
            }; 
        }
        throw new Error(`Couldn\'t return category with NAME ${name}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
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

        let category = await getCategoryByName(data.name);
        if (!category.success) {
            const result = await Category({
                id: idIndex,
                name: data.name,
                description: data.description || null,
                createdAt: date,
            }).save();
            // If new category was created return it's value
            if (result) {
                return {
                    success: true,
                    message: `Category was created...`,
                    body: [result],
                }; 
            }
            throw new Error('Couldn\'t create new category...');
        }
        throw new Error(`Category with NAME ${data.name} already exists...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    addNewCategory,
}