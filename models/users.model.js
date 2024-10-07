const Models = require("./mongo.model");

const customersModel = require("./customers.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../utils/validations");
const security = require("../utils/security.password");
const functionTace = require("../utils/function.trace");

async function getAllUsers() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Models.User.find({}, {})
        .populate("customer")
        .exec();
        if (!result) {
            throw new Error(`Couldn\'t find Users...`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getAllUsers', null, execTime);

        return {
            success: true,
            message: `Fetched all Users...`,
            body: (Array.isArray(result) ? result : [result]),
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getAllUsers', null, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getUserById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        // fetch User with ${id} and populate User with Customer data
        const result = await Models.User.findOne({ id: id })
        .populate("customer")
        .exec();
        
        if (!result) {
            throw new Error(`Couldn\'t return user with ID ${id}`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getUserById', id, execTime);

        return {
            success: true,
            message: `User with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getUserById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getUserByEmail(email) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(email);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const result = await Models.User.findOne({ email: email }).exec();
        if (!result) {
            throw new Error(`Couldn\'t return user with EMAIL ${email}`);
        }

        await result.populate("customer");

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getUserByEmail', email, execTime);

        return {
            success: true,
            message: `User with email ${email} found...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getUserByEmail', email, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewUser(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
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

        const emailExists = await Models.User.findOne({ email: data.email }, 'id');
        if (emailExists) {
            throw new Error(`Email ${data.email} already in use...`);
        }
        
        const customerResult = await customersModel.addNewCustomer(data);
        if (!customerResult.success) {
            throw new Error("Couldn't create new Customer...");
        }

        const customerObjectId = await Models.Customer.findOne({ email: data.email }, '_id');
        
        if (!customerObjectId) {
            throw new Error("Couldn't retrieve Customer data...");
        }
        objectId = customerObjectId._id;
        
        const idIndex = await getNextId("userId");
        const date = await validations.getDate();
        
        const { hash, salt } = await security.hashPassword(data.password);
        
        const result = await Models.User({
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
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('addNewUser', data, execTime);

        return {
            success: true,
            message: `User ID is ${result.id}...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('addNewUser', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function updateUserPasswordById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const userExists = await Models.User.findOne(
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
        
        const result = await Models.User.updateOne(
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
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('updateUserPasswordById', data, execTime);

        return {
            success: true,
            message: `User with ID ${data.id} was updated...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('updateUserPasswordById', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function deleteUserById(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const userExists = await Models.User.findOne(
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

        result = await Models.User.updateOne(
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
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('deleteUserById', data, execTime);

        return {
            success: true,
            message: `User with ID ${data.id} was deleted...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('deleteUserById', data, err.message);
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
