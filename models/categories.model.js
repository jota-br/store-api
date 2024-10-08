const Category = require("./categories.mongo");

const { getNextId } = require("../idindex/id.index");
const helpers = require("../utils/helpers");
const functionTace = require("../utils/logger");

async function getAllCategories() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Category.find({}, {}).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Categories...`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Fetched all Categories...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getCategoryById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Category.findOne({ id: Number(id) });
        if (!result) {
            throw new Error(`Couldn\'t return category with ID ${id}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Category with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getCategoryByName(name) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Category.findOne(
            { name: new RegExp(`${name}`, "i") }
        ).exec();
        if (!result) {
            throw new Error(`Couldn\'t return Category with NAME ${name}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit(execTime);
        return {
            success: true,
            message: `Category with NAME ${name} found...`,
            body: [result],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function addNewCategory(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        let category = await Category.findOne({ name: data.name }, 'name');
        if (category) {
            throw new Error(`Category with NAME ${data.name} already exists...`,);
        }

        const idIndex = await getNextId("categoryId");
        const date = await helpers.getDate();

        const result = await Category({
            id: idIndex,
            name: data.name,
            description: data.description || null,
            createdAt: date,
        }).save();

        if (!result) {
            throw new Error("Couldn't create new category...");
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Category was created...`,
            body: [result],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function updateCategoryById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const categoryExists = await Category.findOne({ id: data.id }, 'name');
        if (!categoryExists) {
            throw new Error(`Couldn\'t find Category with ID ${id}`);
        }

        let dataToUse = {
            name: (data.name) ? data.name : categoryExists.name,
            description: (data.description) ? data.description : categoryExists.description,
        }

        const date = await helpers.getDate();

        const result = await Category.updateOne(
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
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Category was created...`,
            body: [],
        };

    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

// Slave deleteCategoryById
async function deleteCategoryById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Category.deleteOne({ id: id });

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit(execTime);

        return (result.deletedCount === 1);
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
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
