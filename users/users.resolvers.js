const usersModel = require('./users.model');

module.exports = {
    Query: {
        users: async () => {
            return await usersModel.getAllUsers();
        },
        getUserById: async (_, args) => {
            return await usersModel.getUserById(args.id);
        },
        getUserByEmail: async (_, args) => {
            return await usersModel.getUserByEmail(args.email);
        }
    },
    Mutation: {
        addNewUser: async (_, args) => {
            return await usersModel.addNewUser(args);
        },
        updateUserPasswordById: async (_, { input }) => {
            return await usersModel.updateUserPasswordById(input);
        },
        deleteUserById: async (_, args) => {
            return await usersModel.deleteUserById(args.id);
        }
    }
}