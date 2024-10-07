const Review = require("./reviews.mongo");
const Customer = require("./customers.mongo");
const Product = require("./products.mongo");

const customersModel = require("./customers.model");
const productsModel = require("./products.model");

const { getNextId } = require("../idindex/id.index");
const helpers = require("../utils/helpers");
const functionTace = require("../utils/logger");

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
        await functionTace.functionTraceEmitError('getAllReviews', null, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getReviewById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(id);
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
        await functionTace.functionTraceEmitError('getReviewById', id, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function addNewReview(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        // get customer ObjectId
        const customerObjectId = await Customer.findOne({ id: data.customer }, '_id');
        if (!customerObjectId) {
            throw new Error("Invalid Customer ID...");
        }

        // get customer ObjectId
        const productObjectId = await Product.findOne({ id: data.product }, '_id');
        if (!productObjectId) {
            throw new Error("Invalid Product ID...");
        }

        idIndex = await getNextId("reviewId");
        date = await helpers.getDate();

        const result = await Review(
            {
                id: idIndex,
                comment: data.comment,
                rating: data.rating,
                customer: customerObjectId._id,
                product: productObjectId._id,
                createdAt: date,
            },
        ).save();

        if (!result) {
            throw new Error("Couldn't create new review...");
        }

        const reviewObjectId = await Review.findOne({ id: idIndex }, '_id').exec();
        let ProductWithReview = {
            _id: productObjectId._id,
            objectId: reviewObjectId._id,
        };
        if (!reviewObjectId) {
            throw new Error(`Couldn\'t find Review with ID ${id}`);
        }

        const productResult = await productsModel.addNewReviewToProduct(ProductWithReview);
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
        await functionTace.functionTraceEmitError('addNewReview', data, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function updateReviewById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const reviewExists = await Review.findOne({ id: data.id }, 'rating comment');
        if (!reviewExists) {
            throw new Error(`Couldn\'t find Review with ID ${data.id}`);
        }

        const date = await helpers.getDate();
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
        await functionTace.functionTraceEmitError('updateReviewById', data, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

module.exports = {
    getAllReviews,
    getReviewById,
    addNewReview,
    updateReviewById,
};
