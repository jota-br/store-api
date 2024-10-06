const Review = require("./reviews.mongo");

const customersModel = require("../customers/customers.model");
const productsModel = require("../products/products.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../services/validations");
const functionTace = require("../services/function.trace");

async function getAllReviews() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Review.find({}, {})
        .populate("customer")
        .populate("product")
        .exec();
        
        if (!result) {
            throw new Error(`Couldn\'t find Reviews...`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getAllReviews', null, execTime);

        return {
            success: true,
            message: `Fetched all reviews...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getAllReviews', null, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getReviewById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Review.findOne({ id: Number(id) })
        .populate("customer")
        .populate("product")
        .exec();

        if (!result) {
            throw new Error(`Couldn\'t return Review with ID ${id}`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getReviewById', id, execTime);

        return {
            success: true,
            message: `Fetched Review with ID ${id}...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getReviewById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewReview(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        // get customer ObjectId
        const customerObjectId = await customersModel.getCustomerById(data.customer);
        if (!customerObjectId.success) {
            throw new Error("Invalid Customer ID...");
        }
        
        // get customer ObjectId
        const productObjectId = await productsModel.getProductById(data.product);
        if (!productObjectId.success) {
            throw new Error("Invalid Product ID...");
        }

        idIndex = await getNextId("reviewId");
        date = await validations.getDate();
        
        const result = await Review(
            {
                id: idIndex,
                comment: data.comment,
                rating: data.rating,
                customer: customerObjectId.body[0]._id,
                product: productObjectId.body[0]._id,
                createdAt: date,
            },
        ).save();
        
        if (!result) {
            throw new Error("Couldn't create new review...");
        }
        
        const reviewObjectId = await Review.findOne(
            { id: idIndex },
            { _id: 1 },
        ).exec();
        let ProductWithReview = {
            _id: productObjectId.body[0]._id,
            objectId: reviewObjectId._id,
        };
        if (!reviewObjectId) {
            throw new Error(`Couldn\'t find Review with ID ${id}`);
        }
        
        const productResult =
            await productsModel.addNewReviewToProduct(ProductWithReview);
            if (!productResult) {
                throw new Error(`Couldn\'t associate Review with Product...`);
            }
            
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('addNewReview', data, execTime);

        return {
            success: true,
            message: `Review was created...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('addNewReview', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function updateReviewById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const reviewExists = await Review.findOne({ id: data.id }, {});
        if (!reviewExists) {
            throw new Error(`Couldn\'t find Review with ID ${data.id}`);
        }
        
        date = await validations.getDate();
        const result = await Review.updateOne(
            { id: data.id },
            {
                rating: data.rating || reviewExists.rating,
                comment: data.comment || reviewExists.comment,
                updatedAt: date,
            },
            { upsert: true },
        );
        
        if (!result.acknowledged) {
            throw new Error(`Couldn\'t update Review with ID ${data.id}`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('updateReviewById', data, execTime);

        return {
            success: true,
            message: `Review was updated...`,
            body: [],
        };
        
    } catch (err) {
        functionTace.functionTraceEmitError('updateReviewById', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
} 

module.exports = {
    getAllReviews,
    getReviewById,
    addNewReview,
    updateReviewById,
};
