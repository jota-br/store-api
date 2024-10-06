const Product = require("./products.mongo");
const Review = require("../reviews/reviews.mongo");

const categoriesModel = require("../categories/categories.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../services/validations");
const functionTace = require("../services/function.trace");

async function getAllProducts() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Product.find({}, {})
            .populate("categories")
            .populate("reviews")
            .exec();
        if (!result) {
            throw new Error(`Couldn\'t find Products...`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getAllProducts', null, execTime);

        return {
            success: true,
            message: `Fetched all Products...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getAllProducts', null, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getProductById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const result = await Product.findOne({ id: id })
        .populate("categories")
        .populate("reviews")
            .exec();
            if (!result) {
                throw new Error(`Couldn\'t return product with ID ${id}`);
            }
            
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getProductById', id, execTime);
        
        return {
            success: true,
            message: `Product with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getProductById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getProductByName(name) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const result = await Product.find({
            name: new RegExp(name.split(" ").join("|"), "i"),
        })
            .populate("categories")
            .populate("reviews")
            .exec();
            if (!result) {
                throw new Error(`Couldn\'t return product with name ${name}`);
            }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getProductByName', name, execTime);

        return {
            success: true,
            message: `Product with name ${name} found...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getProductByName', name, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Slave addNewReview
async function addNewReviewToProduct(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const productExists = await Product.findOne(
            { _id: data._id },
            { id: 1, reviews: 1 },
        );
        
        if (!productExists) {
            throw new Error(
                `Couldn\'t find Product with ID ${productExists.id}...`,
            );
        }
        let arr = [];
        if (productExists.length > 0) {
            arr = [...productExists];
        }
        arr.push(data.objectId);
        const result = await Product.updateOne(
            { _id: data._id },
            { 
                reviews: arr, 
                
            },
            { upsert: true },
        );
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getProductByName', data, execTime);

        return (result.acknowledged);
    } catch (err) {
        functionTace.functionTraceEmitError('getProductByName', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// async function addNewCategoryToProduct(data) {
//     try {
//         const isValidString = await validations.validateString(data);
//         if (!isValidString) {
//             throw new Error(`Invalid input...`);
//         }

//         const productExists = await Product.findOne(
//             { id: data.id },
//             { _id: 1 },
//         ).exec();

//         if (!productExists) {
//             throw new Error(`Couldn\'t find product with ID ${data.id}...`);
//         }

//         let arr = [];
//         await Promise.all(
//             await data.categories.map(async (name) => {
//                 let category = await categoriesModel.getCategoryByName(name);
//                 if (!category) {
//                     category = await categoriesModel.addNewCategory({ name });
//                 }
//                 arr.push(category._id);
//             }),
//         );

//         const date = await validations.getDate();
//         const result = await Product.updateOne(
//             { _id: productExists._id },
//             { categories: arr, updatedAt: date },
//             { upsert: true },
//         );

//         if (!result.acknowledged) {
//             throw new Error(
//                 `Couldn\'t insert Categories to Product with ID ${data.id}...`,
//             );
//         }
        
//         return {
//             success: true,
//             message: `Categories have been inserted to Product with ID ${data.id}...`,
//             body: [],
//         };
//     } catch (err) {
//         console.error(err.message);
//         return { success: false, message: err.message, body: [] };
//     }
// }

async function addNewProduct(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        let arr = [];
        await Promise.all(
            await data.categories.map(async (name) => {
                let category = await categoriesModel.getCategoryByName(name);
                if (!category.success) {
                    category = await categoriesModel.addNewCategory({ name });
                }
                arr.push(category.body[0]._id);
            }),
        );

        const idIndex = await getNextId("productId");
        const date = await validations.getDate();
        
        const result = await Product({
            id: idIndex,
            name: data.name,
            description: data.description,
            price: data.price,
            stockQuantity: data.stockQuantity,
            categories: arr,
            createdAt: date,
        }).save();
        
        if (!result) {
            throw new Error("Couldn't create new product...");
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('addNewProduct', data, execTime);

        return {
            success: true,
            message: `Product ID is ${result.id}...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('addNewProduct', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function updateProductById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        let productExists = await Product.findOne({ id: data.id }, {})
            .populate("categories")
            .exec();

        if (!productExists) {
            throw new Error(`Couldn\'t find Product with ID ${data.id}...`);
        }

        let arr = [];
        if (productExists.categories) {
            arr = [...productExists.categories];
        }

        let comparingArr = [];
        await Promise.all(
            await productExists.categories.map(async (item) => {
                comparingArr.push(item.name);
            }),
        );

        if (data.categories) {
            await Promise.all(
                await data.categories.map(async (name) => {
                    if (!comparingArr.includes(name)) {
                        let category = await categoriesModel.getCategoryByName(name);
                        if (!category.success) {
                            category = await categoriesModel.addNewCategory({ name });
                        }
                        arr.push(category.body[0]._id);
                    }
                }),
            );
        }

        let dataToUse = {
            id: data.id,
            name: data.name ? data.name : productExists.name,
            description: data.description ? data.description : productExists.description,
            price: data.price ? data.price : productExists.price,
            stockQuantity: data.stockQuantity ? data.stockQuantity : productExists.stockQuantity,
            categories: arr,
            createdAt: productExists.createdAt,
            updatedAt: await validations.getDate(),
        };

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
        
        if (!result.acknowledged) {
            throw new Error(`Couldn\'t update Product with ID ${data.id}...`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('updateProductById', data, execTime);

        return {
            success: true,
            message: `Product with ID ${dataToUse.id} was updated...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('updateProductById', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// async function activateDeactivateProductById(id) {
//     try {
//         let isValidString = await validations.validateString(id);
//         if (!isValidString) {
//             throw new Error(`Invalid input...`);
//         }

//         const productExists = await Product.findOne(
//             { id: id },
//             { active: 1 },
//         ).exec();
//         if (!productExists) {
//             throw new Error(`Couldn\'t find product with ID ${id}...`);
//         }

//         const date = await validations.getDate();
//         const result = await Product.updateOne(
//             { id: id },
//             {
//                 active: productExists.active ? false : true,
//                 updatedAt: date,
//             },
//             { upsert: true },
//         );

//         if (!result.acknowledged) {
//             throw new Error(
//                 `Couldn\'t ${productExists.active ? "deactivated" : "activated"} product with ID ${id}...`,
//             );
//         }

//         const updatedResult = await Product.findOne({ id: id }, {})
//             .populate("categories")
//             .populate("reviews")
//             .exec();
//         if (!updatedResult) {
//             throw new Error(`Couldn\'t find product with ID ${id}...`);
//         }
//         return {
//             success: true,
//             message: `Product with ID ${id} was ${productExists.active ? "deactivated" : "activated"}`,
//             body: [updatedResult],
//         };
//     } catch (err) {
//         console.error(err.message);
//         return { success: false, message: err.message, body: [] };
//     }
// }

async function deleteProductById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        let fetchData = await Product.findOne(
            { id: id },
            { id: 1, reviews: 1 },
        ).exec();
        if (!fetchData) {
            throw new Error(`Product with ID ${id} was not found...`);
        }

        await Promise.all(
            await fetchData.reviews.map(async (reviewId) => {
                if (reviewId) {
                    const reviewResult = await Review.updateOne(
                        { _id: reviewId },
                        { deleted: true, },
                        { upsert: true },
                    );
                    
                    if (!reviewResult.acknowledged) {
                        throw new Error(`Couldn\'t delete Review...`);
                    }
                }
            }),
        );
        
        const result = await Product.updateOne(
            { id: id },
            { deleted: true },
            { upsert: true },
        );
        if (!result.acknowledged) {
            throw new Error(`Couldn\'t delete product with ID ${id}...`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('deleteProductById', null, execTime);

        return {
            success: true,
            message: `Product with ID ${id} was deleted...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('deleteProductById', null, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Slave deleteCategoryById
async function deleteCategoryFromProductById(categoryId) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let categoryExistsInProduct = await Product.findOne(
            { categories: categoryId },
            { id: 1, categories: 1 },
        );
        if (!categoryExistsInProduct) {
            throw new Error(
                `Couldn\'t find Category associated with Product ID ${categoryExistsInProduct.id}...`,
            );
        }

        const index = categoryExistsInProduct.categories.indexOf(categoryId);
        if (index === -1) {
            throw new Error(
                `Couldn\'t find Category associated with Product ID ${categoryExistsInProduct.id}...`,
            );
        }
        categoryExistsInProduct.categories.splice(index);

        const date = await validations.getDate();

        const result = await Product.updateOne(
            { categories: categoryId },
            {
                categories: categoryExistsInProduct.categories,
                updatedAt: date,
            },
            { upsert: true },
        );
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('deleteCategoryFromProductById', id, execTime);

        return (result.acknowledged);
    } catch (err) {
        functionTace.functionTraceEmitError('deleteCategoryFromProductById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function deleteCategoryById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const categoryExists = await categoriesModel.getCategoryById(id);
        if (!categoryExists.success) {
            throw new Error(`Couldn\'t find Category with ID ${id}`);
        }
        
        if (categoryExists.deleted) {
            throw new Error(`Category with ID ${id} already deleted...`);
        }
        
        const productResult = await deleteCategoryFromProductById(categoryExists.body[0]._id);
        
        if (!productResult) {
            throw new Error(`Couldn\'t delete Category with ID ${id} from associated Product\'s...`);
        }

        const result = await categoriesModel.deleteCategoryByIdUtil(id);
        
        if (!result) {
            throw new Error(`Couldn\'t delete Category with ID ${id}...`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('deleteCategoryById', id, execTime);

        return {
            success: true,
            message: `Category was deleted...`,
            body: [],
        };

    } catch (err) {
        functionTace.functionTraceEmitError('deleteCategoryById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductByName,
    addNewReviewToProduct,
    // addNewCategoryToProduct,
    addNewProduct,
    updateProductById,
    // activateDeactivateProductById,
    deleteProductById,
    deleteCategoryById,
};
