const Product = require('./products.mongo');

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
        const result = await Product.findOne({ id: Number(id) });
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
        const products = await Product.find({ name: new RegExp(query.split(' ').join('|'), 'i') }).exec();
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
    const docs = await Product.countDocuments();
    const newProduct = {
        id: docs,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stockQuantity: Number(data.stockQuantity),
    }
    try {    
        const result = await Product.updateOne({
            name: newProduct.name,
        }, {
            id: newProduct.id,
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stockQuantity: newProduct.stockQuantity,
        }, {
            upsert: true,
        });
        if (result.acknowledged === true) {
            return newProduct;
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