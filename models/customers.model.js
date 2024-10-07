const Customer = require("./customers.mongo");
const User = require("./users.mongo");

const { getNextId } = require("../idindex/id.index");
const helpers = require("../utils/helpers");
const security = require("../utils/security.password");
const functionTace = require("../utils/logger");

async function getAllCustomers() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Customer.find({}, {}).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Customers...`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getAllCustomers', null, execTime);

        return {
            success: true,
            message: `Fetched all Customers...`,
            body: (Array.isArray(result) ? result : [result]),
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('getAllCustomers', null, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getCustomerById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Customer.findOne({ id: id });
        if (!result) {
            throw new Error(`Couldn\'t return customer with ID ${id}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getCustomerById', id, execTime);

        return {
            success: true,
            message: `Customer with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('getCustomerById', id, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getCustomerByEmail(email) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidEmail = await helpers.validateEmail(email);
        if (!isValidEmail) {
            throw new Error(
                `Email ${data.email} is invalid. Valid email format example@example.com....`,
            );
        }

        const result = await Customer.findOne({ email: email }, {}).exec();
        if (!result) {
            throw new Error(`Couldn\'t return Customer with EMAIL ${email}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getCustomerByEmail', email, execTime);

        return {
            success: true,
            message: `Customer with EMAIL ${email} found...`,
            body: [result],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('getCustomerByEmail', email, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function updateCustomerById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);

        let isValidString = await helpers.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const customerWithIdExists = await Customer.findOne({ id: data.id }, { id: 1, firstName: 1, lastName: 1, phone: 1, address: 1, email: 1 });
        if (!customerWithIdExists) {
            throw new Error(`Couldn\'t find Customer with ID ${data.id}...`);
        }

        const userWithIdExists = await User.findOne({ email: customerWithIdExists.email }, { salt: 1, hash: 1 });
        if (!userWithIdExists) {
            throw new Error(`Couldn\'t find User with ID ${data.id}...`);
        }

        const validCredential = await security.verifyPassword(
            data.password,
            userWithIdExists.salt,
            userWithIdExists.hash,
        );

        if (!validCredential) {
            throw new Error(`Invalid credential...`);
        }

        const date = await helpers.getDate();
        const dataToUse = {
            firstName: await (data.firstName) ? data.firstName : customerWithIdExists.firstName,
            lastName: await (data.lastName) ? data.lastName : customerWithIdExists.lastName,
            phone: await (data.phone) ? data.phone : customerWithIdExists.phone,
            address: await (data.address) ? data.address : customerWithIdExists.address,
            updatedAt: date,
        };

        const result = await Customer.updateOne(
            { id: data.id },
            {
                firstName: dataToUse.firstName,
                lastName: dataToUse.lastName,
                phone: dataToUse.phone,
                address: dataToUse.address,
                updatedAt: dataToUse.updatedAt,
            },
            { upsert: true }
        );

        if (!result.acknowledged) {
            throw new Error(`Couldn\'t update Customer with ID ${data.id}...`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('updateCustomerById', data, execTime);

        return {
            success: true,
            message: `Customer updated...`,
            body: [],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('updateCustomerById', data, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

// Slave addNewUser
async function addNewCustomer(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const isValidEmail = await helpers.validateEmail(data.email);
        if (!isValidEmail) {
            throw new Error(
                `Email ${data.email} is invalid. Valid email format example@example.com....`,
            );
        }

        const emailExists = await Customer.findOne({ email: data.email }, { id: 1 });
        if (emailExists) {
            throw new Error(`Email ${data.email} already in use...`);
        }

        const idIndex = await getNextId("customerId");
        const date = await helpers.getDate();

        const result = await Customer({
            id: idIndex,
            firstName: data.firstName || null,
            lastName: data.lastName || null,
            email: data.email,
            phone: data.phone || null,
            address: data.address || null,
            createdAt: date,
        }).save();

        if (!result) {
            throw new Error("Couldn\'t create new customer...");
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('addNewCustomer', data, execTime);

        return {
            success: true,
            message: `Customer ID is ${result.id}...`,
            body: [],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('addNewCustomer', data, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

// Slave deleteUserById
async function deleteCustumerById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const date = await helpers.getDate();
        const result = await Customer.updateOne(
            { id: id },
            {
                deleted: true,
                updatedAt: date,
            },
            { upsert: true },
        );

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('deleteCustomerById', id, execTime);

        return (result.acknowledged);
    } catch (err) {
        await functionTace.functionTraceEmitError('deleteCustomerById', id, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByEmail,
    addNewCustomer,
    deleteCustumerById,
    updateCustomerById,
};
