const Supplier = require("./suppliers.mongo");

const { getNextId } = require("../idindex/id.index");
const helpers = require("../utils/helpers");
const functionTace = require("../utils/logger");

async function getAllSuppliers() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Supplier.find({}, {}).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Suppliers...`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getAllSuppliers', null, execTime);

        return {
            success: true,
            message: `Fetched all Suppliers...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('getAllSuppliers', null, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getSupplierById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Supplier.findOne({ id: id }).exec();
        if (!result) {
            throw new Error(`Couldn\'t find Supplier with ID ${id}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getSupplierById', id, execTime);

        return {
            success: true,
            message: `Supplier with ID ${id} found...`,
            body: [result],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('getSupplierById', id, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getSupplierByName(name) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Supplier.find({
            supplierName: new RegExp(name.split(" ").join("|"), "i"),
        }).exec();

        if (!result) {
            throw new Error(`Couldn\'t find supplier with NAME ${name}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getSupplierByName', name, execTime);

        return {
            success: true,
            message: `Supplier with NAME ${name} found...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('getSupplierByName', name, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function addNewSupplier(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const supplierExists = await Supplier.findOne({ name: new RegExp(`${data.name}`, "i") }, 'id');

        if (supplierExists) {
            throw new Error("Supplier with NAME ${data.name} already exists...");
        }

        const idIndex = await getNextId("supplierId");
        const date = await helpers.getDate();

        const result = await Supplier({
            id: idIndex,
            supplierName: data.supplierName,
            contactNames: data.contactNames,
            phones: data.phones,
            address: data.address,
            createdAt: date,
        }).save();

        if (!result) {
            throw new Error("Couldn't create new Supplier...");
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('addNewSupplier', data, execTime);

        return {
            success: true,
            message: `Supplier was created...`,
            body: [],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('addNewSupplier', data, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function deleteSupplierById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const supplierExists = await Supplier.findOne({ id: id }, 'id');
        if (!supplierExists) {
            throw new Error(`Couldn\'t find Supplier with ID ${id}`);
        }

        const date = await helpers.getDate();
        const result = await Supplier.updateOne(
            { id: id },
            { deleted: true, updatedAt: date },
            { upsert: true },
        ).exec();

        if (!result.acknowledged) {
            throw new Error(`Couldn\'t delete Supplier with ID ${id}`);
        }

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('deleteSupplierById', id, execTime);

        return {
            success: true,
            message: `Supplier with ID ${id} was deleted...`,
            body: [],
        };
    } catch (err) {
        await functionTace.functionTraceEmitError('deleteSupplierById', id, err.message);
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    getSupplierByName,
    addNewSupplier,
    deleteSupplierById,
};
