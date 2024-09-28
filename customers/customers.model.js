const Customer = require('./costumers.mongo');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllCustomers() {
    try {
        return await Customer.find({}, {}).exec();
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getCustomersById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        const result = await Customer.findOne({ id: Number(id) });
        if (result) {
            return result;
        }
        throw new Error(`Couldn\'t return customer with id: ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getCustomersByEmail(email) {
    try {
        let isValidEmail = await validations.validateEmail(email);
        if (!isValidEmail) {
            throw new Error(`Email ${data.email} is invalid. Valid email format example@example.com....`);
        }

        const result = Customer.findOne({ email: email }, {}).exec();
        if (result) {
            return result;
        }

        throw new Error(`Couldn\'t return customer with email: ${email}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewCustomer(data) {
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

        const emailExists = await getCustomersByEmail(data.email);
        if (emailExists) {
            throw new Error(`Email ${data.email} already in use...`);
        }

        const idIndex = await getNextId('customerId');
        const date = await validations.getDate();

        const result = await Customer({
            id: idIndex,
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            email: data.email,
            phone: data.phone || null,
            address: data.address || null,
            createdAt: date,
        }).save();
        if (result) {
            return result;
        }

        throw new Error('Couldn\'t create new customer...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    getAllCustomers,
    getCustomersById,
    getCustomersByEmail,
    addNewCustomer,
}