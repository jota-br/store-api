const Customer = require('./costumers.mongo');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllCustomers() {
    try {
        const result = await Customer.find({}, {}).exec();
        if (result) {
            return {
                success: true,
                message: `Fetched all Customers...`,
                body: result,
            };
        }
        throw new Error(`Couldn\'t find Customers...`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getCustomerById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        const result = await Customer.findOne({ id: Number(id) });
        if (result) {
            return { 
                success: true, 
                message: `Customer with ID ${id} found...`,
                body: [result],
            };
        }
        throw new Error(`Couldn\'t return customer with ID ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getCustomerByEmail(email) {
    try {
        let isValidEmail = await validations.validateEmail(email);
        if (!isValidEmail) {
            throw new Error(`Email ${data.email} is invalid. Valid email format example@example.com....`);
        }

        const result = await Customer.findOne({ email: email }, {}).exec();
        if (result) {
            return { 
                success: true, 
                message: `Customer with EMAIL ${email} found...`,
                body: [result],
            };
        }

        throw new Error(`Couldn\'t return Customer with EMAIL ${email}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewCustomer(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        // Validate email
        const isValidEmail = await validations.validateEmail(data.email);
        // If email is invalid new Error is Throw
        if (!isValidEmail) {
            throw new Error(`Email ${data.email} is invalid. Valid email format example@example.com....`);
        }

        const emailExists = await getCustomerByEmail(data.email);
        if (emailExists.success) {
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
            return { 
                success: true, 
                message: `Customer ID is ${result.id}...`,
                body: [result],
            };
        }

        throw new Error('Couldn\'t create new customer...');
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Slave deleteUserById
async function deleteCustumerById(id) {
    try {
        const result = await Customer.updateOne(
            { id: id },
            { deleted: true },
            { upsert: true },
        );
        
        return (result.acknowledged);

    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByEmail,
    addNewCustomer,
    deleteCustumerById,
}