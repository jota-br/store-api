const Product = require('./products.mongo');
const Review = require('../reviews/reviews.mongo');

const categoriesModel = require('../categories/categories.model');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllProducts() {
    try {
        const result = await Product.find({}, {})
            .populate('categories')
            .populate('reviews')
            .exec();
        if (result) {
            return { 
                success: true, 
                message: `Fetched all Products...`,
                body: result,
            };
        }
        throw new Error(`Couldn\'t find Products...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getProductById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Product.findOne({ id: id })
            .populate('categories')
            .populate('reviews')
            .exec();
        if (result) {
            return { 
                success: true, 
                message: `Product with ID ${id} found...`,
                body: [result],
            };
        }

        throw new Error(`Couldn\'t return product with ID ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getProductByName(name) {
    try {
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Product.find({
            name: new RegExp(name.split(' ').join('|'), 'i')
        })
            .populate('categories')
            .populate('reviews')
            .exec();
        if (result) {
            return { 
                success: true, 
                message: `Product with name ${name} found...`,
                body: [result],
            };
        }

        throw new Error(`Couldn\'t return product with name ${name}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Used by Review Model
async function addNewReviewToProduct(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const productExists = await Product.findOne(
            { _id: data._id }, { reviews: 1 }
        );

        if (productExists) {
            let arr = [];
            if (productExists.length > 0) {
                arr = [...productExists];
            }
            arr.push(data.objectId);
            const result = await Product.updateOne(
                { _id: data._id },
                { reviews: arr, },
                { upsert: true, },
            );
            if (result.acknowledged === true) {
                return result;
            }
        }

        throw new Error('Couldn\'t add new review to product...');
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewCategoryToProduct(data) {
    try {
        const isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const productExists = await Product.findOne({ id: data.id }, { _id: 1 }).exec();
        if (!productExists) {
            throw new Error(`Couldn\'t find product with ID ${data.id}...`);
        }

        // category object id array
        let arr = [];
        // Wait categoriesMap Promise to resolve
        await Promise.all(
            // categoriesMap Promise
            await data.categories.map(async (name) => {
                // get category ObjectId
                let category = await categoriesModel.getCategoryByName(name);
                if (!category) {
                    // if category is not found, create a new one
                    category = await categoriesModel.addNewCategory({ name });
                }
                // push ObjectId to array
                arr.push(category._id);
            })
        );

        const date = await validations.getDate();
        const result = await Product.updateOne(
            { _id: productExists._id },
            { categories: arr, updatedAt: date },
            { upsert: true, },
        );

        if (result.acknowledged === true) {
            const updatedResult = await Product.findOne({ id: data.id }, {})
                .populate('categories')
                .populate('reviews')
                .exec();
            return { 
                success: true, 
                message: `Categories have been inserted to Product with ID ${data.id}...`, 
                body: [updatedResult] 
            };
        }
        throw new Error(`Couldn\'t insert Categories to Product with ID ${data.id}...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewProduct(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        // category object id array
        let arr = [];
        // Wait categoriesMap Promise to resolve
        await Promise.all(
            // categoriesMap Promise
            await data.categories.map(async (name) => {
                // get category ObjectId
                let category = await categoriesModel.getCategoryByName(name);
                if (!category) {
                    // if category is not found, create a new one
                    category = await categoriesModel.addNewCategory({ name });
                }
                // push ObjectId to array
                arr.push(category._id);
            })
        );

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
            await result.populate('categories');
            await result.populate('reviews');
            return { 
                success: true, 
                message: `Product ID is ${result.id}...`, 
                body: [result] 
            };
        }

        throw new Error('Couldn\'t create new product...');
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function updateProductById(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        let fetchData = await Product.findOne(
            { id: data.id },
            {}
        )
            .populate('categories')
            .exec();

        if (!fetchData) {
            throw new Error(`Couldn\'t find Product with ID ${data.id}...`);
        }

        let arr = [];
        // category object id array
        if (fetchData.categories) {
            arr = [...fetchData.categories];
        }

        let comparingArr = [];
        await Promise.all(
            await fetchData.categories.map(async (item) => {
                comparingArr.push(item.name);
            })
        );

        if (data.categories) {
            // Wait categoriesMap Promise to resolve
            await Promise.all(
                // categoriesMap Promise
                await data.categories.map(async (name) => {
                    // get category ObjectId
                    if (!comparingArr.includes(name)) {
                        let category = await categoriesModel.getCategoryByName(name);
                        if (!category) {
                            // if category is not found, create a new one
                            category = await categoriesModel.addNewCategory({ name });
                        }
                        // push ObjectId to array
                        arr.push(category._id);
                    }
                })
            );
        }

        let dataToUse = {
            id: data.id,
            name: (data.name) ? data.name : fetchData.name,
            description: (data.description) ? data.description : fetchData.description,
            price: (data.price) ? data.price : fetchData.price,
            stockQuantity: (data.stockQuantity) ? data.stockQuantity : fetchData.stockQuantity,
            categories: arr,
            createdAt: fetchData.createdAt,
            updatedAt: await validations.getDate(),
        };

        // Create New Product
        const result = await Product.updateOne(
            { id: dataToUse.id },
            {
                id: dataToUse.id,
                name: dataToUse.name,
                description: dataToUse.description,
                price: dataToUse.price,
                stockQuantity: dataToUse.stockQuantity,
                categories: dataToUse.categories,
                createdAt: dataToUse.createdAt,
                updatedAt: dataToUse.updatedAt,
            },
            { upsert: false },
        );

        if (result.acknowledged === true) {
            const updatedResult = await Product.findOne(
                { id: dataToUse.id },
                {}
            ).exec();
            await updatedResult.populate('categories')
            await updatedResult.populate('reviews')
            return { 
                success: true, 
                message: `Product with ID ${dataToUse.id} was updated...`, 
                body: [updatedResult] 
            }
        }

        throw new Error(`Couldn\'t update Product with ID ${data.id}...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Deprecated
async function activateDeactivateProductById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
    
        const findProduct = await Product.findOne({ id: id }, { active: 1 }).exec();
        if (findProduct) {
            const date = await validations.getDate();
            const result = await Product.updateOne(
                { id: id }, 
                { 
                    active: (findProduct.active) ? false : true, 
                    updatedAt: date 
                }, 
                { upsert: true }
            );
            if (result.acknowledged === true) {
                const updatedResult = await Product.findOne({ id: id }, {})
                    .populate('categories')
                    .populate('reviews')
                    .exec();
                return { 
                    success: true, 
                    message: `Product with ID ${id} was ${(findProduct.active) ? 'deactivated' : 'activated'}`,
                    body: [updatedResult],
                };
            }
            throw new Error(`Couldn\'t ${(findProduct.active) ? 'deactivated' : 'activated'} product with ID ${id}...`);
        }
        throw new Error(`Couldn\'t find product with ID ${id}...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function deleteProductById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        let fetchData = await Product.findOne({ id: id }, { id: 1, reviews: 1 }).exec();
        if (fetchData) {
            await Promise.all(
                await fetchData.reviews.map(async (reviewId) => {
                    if (reviewId) {
                        await Review.updateOne(
                            { _id: reviewId },
                            { deleted: true, },
                            { upsert: true, },
                        );
                    }
                })
            );
            
            const result = await Product.updateOne(
                { id: id },
                { deleted: true, },
                { upsert: true, },
            );
            if (result.acknowledged === true) {
                return { 
                    success: true, 
                    message: `Product with ID ${id} was deleted...`,
                    body: [],
                };
            }
            throw new Error(`Couldn\'t delete product with ID ${id}...`);
        }
        throw new Error(`Product with ID ${id} was not found...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductByName,
    addNewReviewToProduct,
    addNewCategoryToProduct,
    addNewProduct,
    updateProductById,
    activateDeactivateProductById,
    deleteProductById,
}