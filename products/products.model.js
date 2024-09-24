const Product = require('./products.mongo');
const Category = require('../categories/categories.mongo');

const categoriesModel = require('../categories/categories.model');

async function getAllProducts() {
    try {
        return await Product.find({}, {}).exec();
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getProductsById(id) {
    try {
        const result = await Product.findOne({ id: Number(id) }).populate('categories').exec();
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
        const products = await Product.find({ name: new RegExp(query.split(' ').join('|'), 'i') }).populate('categories').exec();
        if (products) {
            return products;
        }
        throw new Error('Something went wrong....');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function addNewProduct(data) {
    try {    
        // Count number of products in Product Collection
        const docs = await Product.countDocuments();
        // category object id array
        let arr = [];
        // get cetegory Object ID (MongoDB id) by name
        for (let name of data.categories) {
            // get category ObjectId -- search by name -- 'i' case insensitive -- return onli _id
            let category = await Category.findOne({ name: new RegExp(name, 'i') }, { _id: 1 });
            if (!category) {
                // if category is not found, create a new one
                category = await categoriesModel.addNewCategory({ name });
            }
            // push ObjectId to array
            arr.push(category._id);
        }
        // Create new product object
        const newProduct = {
            id: Number(docs),
            name: data.name,
            description: data.description,
            price: Number(data.price),
            stockQuantity: Number(data.stockQuantity),
        }
        // Create New Product
        const result = await Product({
            id: newProduct.id,
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stockQuantity: newProduct.stockQuantity,
            categories: arr,
        }).save();
        if (result) {
            // populate the categories with Category data ref Schema.Types.ObjectId from Category collection
            const product = await result.populate('categories');
            // If new product was created return it's value
            return product;
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
    addNewProduct,
}