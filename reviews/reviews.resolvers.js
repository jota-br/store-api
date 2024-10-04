const reviewsModel = require('./reviews.model');

module.exports = {
    Query: {
        reviews: async () => {
            return await reviewsModel.getAllReviews();
        },
        getReviewById: async (_, args) => {
            return await reviewsModel.getReviewById(args.id);
        }
    },
    Mutation: {
        addNewReview: async (_, args) => {
            return await reviewsModel.addNewReview(args);
        },
    }
}