const Review = require('./reviews.mongo');

async function getAllReviews() {
    try {
        return await Review.find({}, {}).exec();
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getReviewsById(id) {
    try {
        // get review with ${id} and populate customer and product data
        const result = await Review.findOne({ id: Number(id) }).populate('Customer').populate('Product').exec();
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
        const customerObjectId = '';
        // Count number of reviews in Review collaction
        const docs = await Review.countDocuments();
    } catch (err) {

    }
}