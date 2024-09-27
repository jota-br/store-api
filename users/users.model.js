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
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await User.findOne({ id: id })
            .populate('customer')
            .exec();
        if (result) {
            return result;
        }

        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getUsersByEmail(query) {
    try {
        let isValidString = await validations.validateString(query);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await User.findOne({ email: query })
            .exec();
        if (result) {
            result.populate('customer');
            return result;
        }

        throw new Error('Something went wrong...');
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
        // If email is invalid new Error is Throw
        if (!isValidEmail) {
            throw new Error(`Email ${data.email} is invalid. Valid email format example@example.com....`);
        }

        const emailExists = await getUsersByEmail(data.email);
        if (emailExists.email) {
            throw new Error(`Email ${data.email} already in use...`);
        }

        let objectId = '';
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
            customer: null,
            createdAt: date,
        }).save();

        if (result) {
            await result.populate('customer');
            return result;
        }

        throw new Error('Something went wrong...');
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