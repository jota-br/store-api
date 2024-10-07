const Models = require("./mongo.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../utils/validations");
const functionTace = require("../utils/function.trace");

async function getAllSuppliers() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Models.Supplier.find({}, {}).exec();
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
        functionTace.functionTraceEmitError('getAllSuppliers', null, err.message);
        return { success: false, message: err.message, body: null };
    }
}

async function getSupplierById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const result = await Models.Supplier.findOne({ id: id }).exec();
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
        functionTace.functionTraceEmitError('getSupplierById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getSupplierByName(name) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const result = await Models.Supplier.find({
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
        functionTace.functionTraceEmitError('getSupplierByName', name, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewSupplier(data) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }
        
        const supplierExists = await Models.Supplier.findOne({ name: new RegExp(`${data.name}`, "i") }, 'id');
        
        if (supplierExists) {
            throw new Error("Supplier with NAME ${data.name} already exists...");
        }

        const idIndex = await getNextId("supplierId");
        const date = await validations.getDate();
        
        const result = await Models.Supplier({
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
        functionTace.functionTraceEmitError('addNewSupplier', data, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function deleteSupplierById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid input...`);
        }

        const supplierExists = await Models.Supplier.findOne({ id: id }, 'id');
        if (!supplierExists) {
            throw new Error(`Couldn\'t find Supplier with ID ${id}`);
        }
        
        const date = await validations.getDate();
        const result = await Models.Supplier.updateOne(
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
        functionTace.functionTraceEmitError('deleteSupplierById', id, err.message);
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
