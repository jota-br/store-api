const usersModel = require('./users.model');

module.exports = {
    Query: {
        users: async () => {
            return await usersModel.getAllUsers();
        },
        user: async (_, args) => {
            return await usersModel.getUsersById(args.id);
        },
        getUsersByEmail: async (_, args) => {
            return await usersModel.getUsersByEmail(args.email);
        }
    },
    Mutation: {
        addNewUser: async (_, args) => {
            return await usersModel.addNewUser(args);
        }
    }
}