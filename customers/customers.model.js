const Customer = require("./costumers.mongo");
const User = require("../users/users.mongo");

const { getNextId } = require("../idindex/id.index");
const validations = require("../services/validations");
const security = require("../services/security.password");

// async function getAllCustomers() {
//     try {
//         const result = await Customer.find({}, {}).exec();
//         if (!result) {
//             throw new Error(`Couldn\'t find Customers...`);
//         }

//         return {
//             success: true,
//             message: `Fetched all Customers...`,
//             body: (Array.isArray(result) ? result : [result]),
//         };
//     } catch (err) {
//         console.error(err.message);
//         return { success: false, message: err.message, body: [] };
//     }
// }

// async function getCustomerById(id) {
//     try {
//         let isValidString = await validations.validateString(id);
//         if (!isValidString) {
//             throw new Error(`Invalid input...`);
//         }

//         const result = await Customer.findOne({ id: id });
//         if (!result) {
//             throw new Error(`Couldn\'t return customer with ID ${id}`);
//         }

//         return {
//             success: true,
//             message: `Customer with ID ${id} found...`,
//             body: [result],
//         };
//     } catch (err) {
//         console.error(err.message);
//         return { success: false, message: err.message, body: [] };
//     }
// }

// async function getCustomerByEmail(email) {
//     try {
//         let isValidEmail = await validations.validateEmail(email);
//         if (!isValidEmail) {
//             throw new Error(
//                 `Email ${data.email} is invalid. Valid email format example@example.com....`,
//             );
//         }

//         const result = await Customer.findOne({ email: email }, {}).exec();
//         if (!result) {
//             throw new Error(`Couldn\'t return Customer with EMAIL ${email}`);
//         }

//         return {
//             success: true,
//             message: `Customer with EMAIL ${email} found...`,
//             body: [result],
//         };
//     } catch (err) {
//         console.error(err.message);
//         return { success: false, message: err.message, body: [] };
//     }
// }

async function updateCustomerById(data) {
    try {
        
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const customerWithIdExists = await Customer.findOne({ id: data.id }, { id: 1, firstName: 1, lastName: 1, phone: 1, address: 1, email: 1 });
        if (!customerWithIdExists) {
            throw new Error(`Couldn\'t find Customer with ID ${data.id}...`);
        }

        const userWithIdExists = await User.findOne({ email: customerWithIdExists.email}, { salt: 1, hash: 1 });
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

        const date = await validations.getDate();
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

        return {
            success: true,
            message: `Customer updated...`,
            body: [],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Slave addNewUser
async function addNewCustomer(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const isValidEmail = await validations.validateEmail(data.email);
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

        if (!result) {
            throw new Error("Couldn\'t create new customer...");
        }

        return {
            success: true,
            message: `Customer ID is ${result.id}...`,
            body: [],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

// Slave deleteUserById
async function deleteCustumerById(id) {
    try {
        const date = await validations.getDate();
        const result = await Customer.updateOne(
            { id: id },
            { 
                deleted: true,
                updatedAt: date,
            },
            { upsert: true },
        );

        return (result.acknowledged);
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    addNewCustomer,
    deleteCustumerById,
    updateCustomerById,
};
