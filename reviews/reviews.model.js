const Review = require('./reviews.mongo');

const customersModel = require('../customers/customers.model');
const productsModel = require('../products/products.model');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllReviews() {
    try {
        return await Review.find({}, {})
        .populate('customer')
        .populate('product')
        .exec();
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getReviewsById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        // get review with ${id} and populate customer and product data
        const result = await Review.findOne({ id: Number(id) })
            .populate('customer')
            .populate('product')
            .exec();
        // if review is found return it's value
        if (result) {
            return result;
        }

        throw new Error(`Couldn\'t return review with id: ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewReview(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        // get customer ObjectId
        const customerObjectId = await customersModel.getCustomersById(data.customer);
        if (!customerObjectId) {
            throw new Error('Invalid Customer ID...');
        }

        // get customer ObjectId
        const productObjectId = await productsModel.getProductsById(data.product);
        if (!productObjectId) {
            throw new Error('Invalid Product ID...');
        }

        const hasDateAndId = await Review.findOne(
            { customer: customerObjectId._id, product: productObjectId._id }, { id: 1, createdAt: 1 }
        ).exec();

        let idIndex;
        let date;
        if (!hasDateAndId) {
            idIndex = await getNextId('reviewId');
            date = await validations.getDate();
        } else {
            idIndex = hasDateAndId.id;
            date = hasDateAndId.createdAt;
        }

        const result = await Review.updateOne(
            { customer: customerObjectId._id, product: productObjectId._id },
            {
                id: idIndex,
                comment: data.comment || null,
                rating: data.rating,
                customer: customerObjectId._id,
                product: productObjectId._id,
                createdAt: date,
            },
            { upsert: true },
        );

        if (result.acknowledged === true) {
            const reviewObjectId = await Review.findOne({ id: idIndex }, { _id: 1 }).exec();
            let ProductWithReview = {
                _id: productObjectId._id,
                objectId: reviewObjectId._id,
            }

            const productReview = await productsModel.addNewReviewToProduct(ProductWithReview);
            if (productReview) {
                const updatedReview = await Review.findOne({ customer: customerObjectId._id, product: productObjectId._id }, {})
                    .populate('customer')
                    .populate('product')
                    .exec();
                return updatedReview;
            }
        }

        throw new Error('Couldn\'t create new review...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    getAllReviews,
    getReviewsById,
    addNewReview,
}