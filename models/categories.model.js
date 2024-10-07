const Models = require("./mongo.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../utils/validations");
const functionTace = require("../utils/function.trace");

async function getAllCategories() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Models.Category.find({}, {}).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Categories...`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getAllCategories', null, execTime);

        return {
            success: true,
            message: `Fetched all Categories...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getAllCategories', null, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getCategoryById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Models.Category.findOne({ id: Number(id) });
        if (!result) {
            throw new Error(`Couldn\'t return category with ID ${id}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getCategoryById', id, execTime);

        return {
            success: true,
            message: `Category with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getCategoryById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getCategoryByName(name) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Models.Category.findOne(
            { name: new RegExp(`${name}`, "i") }
        ).exec();
        if (!result) {
            throw new Error(`Couldn\'t return Category with NAME ${name}`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getCategoryByName', name, execTime);
        return {
            success: true,
            message: `Category with NAME ${name} found...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getCategoryByName', name, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewCategory(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        let category = await Models.Category.findOne({ name: data.name }, 'name');
        if (category) {
            throw new Error(`Category with NAME ${data.name} already exists...`,);
        }

        const idIndex = await getNextId("categoryId");
        const date = await validations.getDate();
        
        const result = await Models.Category({
            id: idIndex,
            name: data.name,
            description: data.description || null,
            createdAt: date,
        }).save();
        
        if (!result) {
            throw new Error("Couldn't create new category...");
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('addNewCategory', data, execTime);

        return {
            success: true,
            message: `Category was created...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('addNewCategory', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function updateCategoryById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const categoryExists = await Models.Category.findOne({ id: data.id }, 'name');
        if (!categoryExists) {
            throw new Error(`Couldn\'t find Category with ID ${id}`);
        }

        let dataToUse = {
            name: (data.name) ? data.name :  categoryExists.name,
            description: (data.description) ? data.description :  categoryExists.description,
        }

        const date = await validations.getDate();
        
        const result = await Models.Category.updateOne(
            { id: data.id },
            {
                name: dataToUse.name,
                description: dataToUse.description,
                updatedAt: date,
            },
            { upsert: true }
        );
        
        if (!result.acknowledged) {
            throw new Error(`Couldn\'t update Category with ID ${id}`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('updateCategoryById', data, execTime);

        return {
            success: true,
            message: `Category was created...`,
            body: [],
        };
        
    } catch (err) {
        functionTace.functionTraceEmitError('updateCategoryById', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Slave deleteCategoryById
async function deleteCategoryById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Models.Category.deleteOne({ id: id });

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('deleteCategoryByIdUtil', id, execTime);

        return (result.deletedCount === 1);
    } catch (err) {
        functionTace.functionTraceEmitError('deleteCategoryByIdUtil', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    addNewCategory,
    updateCategoryById,
    deleteCategoryById,
};
