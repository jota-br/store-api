const Review = require('./reviews.mongo');

const customersModel = require('../customers/customers.model');
const productsModel = require('../products/products.model');

const { getNextId } = require('../idindex/id.index');

async function getAllReviews() {
    try {
        return await Review.find({}, {})
        .populate('customer')
        .populate('product')
        .exec();
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getReviewsById(id) {
    try {
        // get review with ${id} and populate customer and product data
        const result = await Review.findOne({ id: Number(id) })
            .populate('customer')
            .populate('product')
            .exec();
        // if review is found return it's value
        if (result) {
            return result;
        }
        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function addNewReview(data) {
    try {
        // get customer ObjectId
        const customerObjectId = await customersModel.getCustomersById(data.customerId);
        if (!customerObjectId) {
            throw new Error('Invalid Customer ID...');
        }
        // get customer ObjectId
        const productObjectId = await productsModel.getProductsById(data.productId);
        if (!productObjectId) {
            throw new Error('Invalid Product ID...');
        }
        // Count number of reviews in Review collaction
        const idIndex = await getNextId('reviewId');
        const result = await Review({
            id: idIndex,
            comment: data.comment || null,
            rating: data.rating,
            customer: customerObjectId._id,
            product: productObjectId._id,
        }).save();
        if (result) {
            // update Product with new review id
            let ProductWithReview = {
                _id: productObjectId._id,
                objectId: result._id,
            }
            const productReview = await productsModel.addNewReviewToProduct(ProductWithReview);
            if (productReview) {
                await result.populate('customer');
                await result.populate('product');
                return result;
            }
        }
        throw new Error('Somenthing went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

module.exports = {
    getAllReviews,
    getReviewsById,
    addNewReview,
}