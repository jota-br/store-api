const User = require("./users.mongo");
const Customer = require("../customers/costumers.mongo");

const customersModel = require("../customers/customers.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../services/validations");
const security = require("../services/security.password");

async function getAllUsers() {
    try {
        const result = await User.find({}, {})
            .populate("customer")
            .exec();
        if (!result) {
            throw new Error(`Couldn\'t find Users...`);
        }

        return {
            success: true,
            message: `Fetched all Users...`,
            body: (Array.isArray(result) ? result : [result]),
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getUserById(id) {
    try {
        // Search id for invalid characters ($)
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        // fetch User with ${id} and populate User with Customer data
        const result = await User.findOne({ id: id })
            .populate("customer")
            .exec();

        if (!result) {
            throw new Error(`Couldn\'t return user with ID ${id}`);
        }

        return {
            success: true,
            message: `User with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getUserByEmail(email) {
    try {
        // Search email for invalid characters ($)
        let isValidString = await validations.validateString(email);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await User.findOne({ email: email }).exec();
        if (!result) {
            throw new Error(`Couldn\'t return user with EMAIL ${email}`);
        }

        await result.populate("customer");
        return {
            success: true,
            message: `User with email ${email} found...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewUser(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        // Validate email
        const isValidEmail = await validations.validateEmail(data.email);
        if (!isValidEmail) {
            throw new Error(
                `Email ${data.email} is invalid. Valid email format: example@example.com....`,
            );
        }

        const emailExists = await User.findOne({ email: data.email }, { id: 1 });
        if (emailExists) {
            throw new Error(`Email ${data.email} already in use...`);
        }

        const customerResult = await customersModel.addNewCustomer(data);
        if (!customerResult) {
            throw new Error("Couldn't create new Customer...");
        }

        const customerObjectId = await Customer.findOne({ email: data.email }, { _id: 1 });

        if (!customerObjectId) {
            throw new Error("Couldn't retrieve Customer data...");
        }
        objectId = customerObjectId._id;

        const idIndex = await getNextId("userId");
        const date = await validations.getDate();

        const { hash, salt } = await security.hashPassword(data.password);

        const result = await User({
            id: idIndex,
            email: data.email,
            salt: salt,
            hash: hash,
            customer: objectId,
            createdAt: date,
        }).save();

        if (!result) {
            throw new Error("Couldn't create new user...");
        }

        return {
            success: true,
            message: `User ID is ${result.id}...`,
            body: [],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function updateUserPasswordById(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const userExists = await User.findOne(
            { id: data.id },
            { salt: 1, hash: 1 },
        ).exec();

        if (!userExists) {
            throw new Error(`Couldn\'t find User with ID ${data.id}...`);
        }

        const validCredential = await security.verifyPassword(
            data.password,
            userExists.salt,
            userExists.hash,
        );

        if (!validCredential) {
            throw new Error(`Invalid credential...`);
        }
        const { hash, salt } = await security.hashPassword(data.newPassword);
        const date = await validations.getDate();

        const result = await User.updateOne(
            { id: data.id },
            {
                salt: salt,
                hash: hash,
                updatedAt: date,
            },
            { upsert: true },
        );

        if (!result.acknowledged) {
            throw new Error(`Couldn\'t update User with ID ${data.id}...`);
        }

        return {
            success: true,
            message: `User with ID ${data.id} was updated...`,
            body: [],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function deleteUserById(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const userExists = await User.findOne(
            { id: data.id },
            { customer: 1, deleted: 1, salt: 1, hash: 1, },
        )
            .populate("customer")
            .exec();

        if (!userExists) {
            throw new Error(`Couldn\'t find User with ID ${data.id}...`);
        }

        if (userExists.deleted) {
            throw new Error(`User with ID ${data.id} already deleted...`);
        }

        const validCredential = await security.verifyPassword(
            data.password,
            userExists.salt,
            userExists.hash,
        );

        if (!validCredential) {
            throw new Error(`Invalid credential...`);
        }

        result = await User.updateOne(
            { id: data.id },
            { deleted: true },
            { upsert: true },
        );

        if (!result.acknowledged) {
            throw new Error(`Couldn\'t delete User with ID ${data.id}...`);
        }

        const customerResult = await customersModel.deleteCustumerById(userExists.customer.id,);

        if (!customerResult) {
            throw new Error(`Couldn\'t delete Customer with ID ${userExists.customer.id} associated with User with ID ${data.id}...`,);
        }

        return {
            success: true,
            message: `User with ID ${data.id} was deleted...`,
            body: [],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    addNewUser,
    updateUserPasswordById,
    deleteUserById,
};
