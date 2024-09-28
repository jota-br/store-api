const User = require('./users.mongo');

const customersModel = require('../customers/customers.model');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');
const security = require('../services/security.password');

async function getAllUsers() {
    try {
        return await User.find({}, {})
            .populate('customer')
            .exec();
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getUsersById(id) {
    try {
        // Search id for invalid characters ($)
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        // fetch User with ${id} and populate User with Customer data
        const result = await User.findOne({ id: id })
            .populate('customer')
            .exec();

        // If User was found return the result
        if (result) {
            return result;
        }

        throw new Error(`Couldn\'t return user with id: ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getUsersByEmail(email) {
    try {
        // Search email for invalid characters ($)
        let isValidString = await validations.validateString(email);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await User.findOne({ email: email })
            .exec();
        if (result) {
            result.populate('customer');
            return result;
        }

        throw new Error(`Couldn\'t return user with email: ${email}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewUser(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        // Validate email
        const isValidEmail = await validations.validateEmail(data.email);
        if (!isValidEmail) {
            throw new Error(`Email ${data.email} is invalid. Valid email format: example@example.com....`);
        }

        const emailExists = await getUsersByEmail(data.email);
        if (emailExists.email) {
            throw new Error(`Email ${data.email} already in use...`);
        }

        const customerResult = await customersModel.addNewCustomer(data);
        if (customerResult.success) {
            throw new Error('Error: ', customerResult.error);
        }

        let objectId = null;
        const customerObjectId = await customersModel.getCustomersByEmail(data.email);
        if (customerObjectId) {
            objectId = customerObjectId;
        }

        const idIndex = await getNextId('userId');
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

        if (result) {
            await result.populate('customer');
            return result;
        }

        throw new Error('Couldn\'t create new user...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    getAllUsers,
    getUsersById,
    getUsersByEmail,
    addNewUser,
}