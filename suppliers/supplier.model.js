const Supplier = require("./supplier.mongo");

const { getNextId } = require("../idindex/id.index");
const validations = require("../services/validations");

async function getAllSuppliers() {
    try {
        const result = await Supplier.find({}, {}).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Suppliers...`);
        }

        return {
            success: true,
            message: `Fetched all Suppliers...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: null };
    }
}

async function getSupplierById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Supplier.findOne({ id: id }).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Supplier with ID ${id}`);
        }
        return {
            success: true,
            message: `Supplier with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getSupplierByName(name) {
    try {
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Supplier.find({
            name: new RegExp(name.split(" ").join("|"), "i"),
        }).exec();

        if (!result) {
            throw new Error(`Couldn\'t find supplier with NAME ${name}`);
        }

        return {
            success: true,
            message: `Supplier with NAME ${name} found...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewSupplier(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const idIndex = await getNextId("supplierId");

        const date = await validations.getDate();

        const result = await Supplier({
            id: idIndex,
            supplierName: data.supplierName,
            contactNames: data.contactNames,
            phones: data.phones,
            address: data.address,
            createdAt: date,
        }).save();

        if (!result) {
            throw new Error("Couldn't create new supplier...");
        }

        return {
            success: true,
            message: `Supplier was created...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function deleteSupplierById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const supplierExists = await Supplier.findOne({ id: id }, { id: 1 });
        if (!supplierExists) {
            throw new Error(`Couldn\'t find Supplier with ID ${id}`);
        }

        const date = await validations.getDate();
        const result = await Supplier.updateOne(
            { id: id },
            { deleted: true, updatedAt: date },
            { upsert: true },
        ).exec();

        if (!result.acknowledged) {
            throw new Error(`Couldn\'t delete Supplier with ID ${id}`);
        }

        return {
            success: true,
            message: `Supplier with ID ${id} was deleted...`,
            body: [],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    getSupplierByName,
    addNewSupplier,
    deleteSupplierById,
};
