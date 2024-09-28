const Product = require('./products.mongo');

const categoriesModel = require('../categories/categories.model');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllProducts() {
    try {
        return await Product.find({}, {})
            .populate('categories')
            .populate('reviews')
            .exec();
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getProductsById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Product.findOne({ id: id })
            .populate('categories')
            .populate('reviews')
            .exec();
        if (result) {
            return result;
        }

        throw new Error(`Couldn\'t return product with id: ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getProductsByName(name) {
    try {
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Product.find({ 
            name: new RegExp(name.split(' ').join('|'), 'i') 
        })
            .populate('categories')
            .populate('reviews')
            .exec();
        if (result) {
            return result;
        }

        throw new Error(`Couldn\'t return product with name: ${name}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewReviewToProduct(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        result = await Product.findOne(
            { _id: data._id }, { reviews: 1 }
        );

        if (result) {
            let arr = [];
            if (result.length > 0) {
                arr = [...result];
            }
            arr.push(data.objectId);
            const reviewPush = await Product.updateOne(
                { _id: data._id },
                { reviews: arr, },
                { upsert: true, },
            );
            return reviewPush;
        }

        throw new Error('Couldn\'t add new review to product...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewCategoryToProduct(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        let result = await Product.findOne({ id: data.id }, { _id: 1 }).exec();
        if (!result) {
            throw new Error(`Couldn\'t find product with id: ${data.id}`);
        }

        // category object id array
        let arr = [];
        // categoriesMap Promise
        const categoriesMap = await data.categories.map(async (name) => {
            // get category ObjectId
            let category = await categoriesModel.getCategoryByName(name);
            if (!category) {
                // if category is not found, create a new one
                category = await categoriesModel.addNewCategory({ name });
            }
            // push ObjectId to array
            arr.push(category._id);
        });
        // Wait categoriesMap Promise to resolve
        await Promise.all(categoriesMap);

        const categoryPush = await Product.updateOne(
            { _id: result._id },
            { categories: arr, },
            { upsert: true, },
        );

        if (categoryPush.acknowledged === true) {
            const updatedProduct = await Product.findOne({ id: data.id }, {})
                .populate('categories')
                .populate('reviews')
                .exec();
            return updatedProduct;
        }
        throw new Error('Couldn\'t update product with new categories...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewProduct(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        // category object id array
        let arr = [];
        // categoriesMap Promise
        const categoriesMap = await data.categories.map(async (name) => {
            // get category ObjectId
            let category = await categoriesModel.getCategoryByName(name);
            if (!category) {
                // if category is not found, create a new one
                category = await categoriesModel.addNewCategory({ name });
            }
            // push ObjectId to array
            arr.push(category._id);
        });
        // Wait categoriesMap Promise to resolve
        await Promise.all(categoriesMap);

        // Get new unique ID
        const idIndex = await getNextId('productId');
        const date = await validations.getDate();

        // Create New Product
        const result = await Product({
            id: idIndex,
            name: data.name,
            description: data.description,
            price: data.price,
            stockQuantity: data.stockQuantity,
            categories: arr,
            createdAt: date,
        }).save();

        if (result) {
            // populate result
            await result.populate('categories');
            await result.populate('reviews');
            // If new product was created return it's value
            return result;
        }

        throw new Error('Couldn\'t create new product...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    getAllProducts,
    getProductsById,
    getProductsByName,
    addNewReviewToProduct,
    addNewCategoryToProduct,
    addNewProduct,
}