const Product = require('./products.mongo');

const categoriesModel = require('../categories/categories.model');
const { getNextId } = require('../idindex/id.index');

async function getAllProducts() {
    try {
        return await Product.find({}, {})
            .populate('categories')
            .populate('reviews')
            .exec();
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getProductsById(id) {
    try {
        const result = await Product.findOne({ id: id })
            .populate('categories')
            .populate('reviews')
            .exec();
        if (result) {
            return result;
        }
        throw new Error('Something went wrong....');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getProductsByName(query) {
    try {
        const products = await Product.find({ name: new RegExp(query.split(' ').join('|'), 'i') })
            .populate('categories')
            .populate('reviews')
            .exec();
        if (products) {
            return products;
        }
        throw new Error('Something went wrong....');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function addNewReviewToProduct(data) {
    try {
        const result = await Product.findOne(
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
        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function addNewProduct(data) {
    try {    
        // Count number of products in Product Collection
        const idIndex = await getNextId('productId');
        // category object id array
        let arr = [];
        // categoriesMap Promise
        const categoriesMap = data.categories.map(async (name) => {
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
        // Create New Product
        const result = await Product({
            id: idIndex,
            name: data.name,
            description: data.description,
            price: data.price,
            stockQuantity: data.stockQuantity,
            categories: arr,
        }).save();
        if (result) {
            // populate result
            await result.populate('categories');
            await result.populate('reviews');
            // If new product was created return it's value
            return result;
        }
        throw new Error('Something went wrong....');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

module.exports = {
    getAllProducts,
    getProductsById,
    getProductsByName,
    addNewReviewToProduct,
    addNewProduct,
}