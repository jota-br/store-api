const Category = require("./categories.mongo");

const { getNextId } = require("../idindex/id.index");
const validations = require("../services/validations");

async function getAllCategories() {
    try {
        const result = await Category.find({}, {}).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Categories...`);
        }

        return {
            success: true,
            message: `Fetched all Categories...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getCategoryById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Category.findOne({ id: Number(id) });
        if (!result) {
            throw new Error(`Couldn\'t return category with ID ${id}`);
        }

        return {
            success: true,
            message: `Category with ID ${id} found...`,
            body: [result],
        };
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

        const result = await Category.findOne(
            { name: new RegExp(`${name}`, "i") },
            {},
        );
        if (!result) {
            throw new Error(`Couldn\'t return Category with NAME ${name}`);
        }

        return {
            success: true,
            message: `Category with NAME ${name} found...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewCategory(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        let category = await getCategoryByName(data.name);
        if (category.success) {
            throw new Error(`Category with NAME ${data.name} already exists...`,);
        }

        const idIndex = await getNextId("categoryId");
        const date = await validations.getDate();
        
        const result = await Category({
            id: idIndex,
            name: data.name,
            description: data.description || null,
            createdAt: date,
        }).save();

        if (!result) {
            throw new Error("Couldn't create new category...");
        }

        return {
            success: true,
            message: `Category was created...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function updateCategoryById(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const categoryExists = await Category.findOne(
            { id: data.id },
            {},
        );
        if (!categoryExists) {
            throw new Error(`Couldn\'t find Category with ID ${id}`);
        }

        let dataToUse = {
            name: (data.name) ? data.name :  categoryExists.name,
            description: (data.description) ? data.description :  categoryExists.description,
        }

        const date = await validations.getDate();

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

        const updatedResult = await Category.findOne({ id: id }, {});

        return {
            success: true,
            message: `Category was created...`,
            body: [updatedResult],
        };
        
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Slave deleteCategoryById
async function deleteCategoryByIdUtil(id) {
    try {
        const result = await Category.deleteOne({ id: id });
        return (result.deletedCount === 1);
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
    updateCategoryById,
    deleteCategoryByIdUtil,
};
