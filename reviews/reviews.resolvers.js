const reviewsModel = require('./reviews.model');

module.exports = {
    Query: {
        reviews: async () => {
            return await reviewsModel.getAllReviews();
        },
        getReviewsById: async (_, args) => {
            return await reviewsModel.getReviewsById(args.id);
        }
    },
    Mutation: {
        addNewReview: async (_, args) => {
            return await reviewsModel.addNewReview(args);
        },
    }
}