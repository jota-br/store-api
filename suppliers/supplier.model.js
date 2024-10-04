const Supplier = require('./supplier.mongo');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllSuppliers() {
    try {
        const result = await Supplier.find({}, {}).exec();
        if (result) {
            return { 
                success: true, 
                message: `Fetched all Suppliers...`,
                body: result,
            };  
        }
        throw new Error(`Couldn\'t find Suppliers...`);
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
        if (result) {
            return { 
                success: true, 
                message: `Supplier with ID ${id} found...`,
                body: result,
            };
        }

        throw new Error(`Couldn\'t return Supplier with ID ${id}`);
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
            name: new RegExp(name.split(' ').join('|'), 'i') 
        }).exec();

        if (result) {
            return { 
                success: true, 
                message: `Supplier with NAME ${name} found...`,
                body: result,
            };
        }

        throw new Error(`Couldn\'t return supplier with NAME ${name}`);
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

        const idIndex = await getNextId('supplierId');

        const date = await validations.getDate();

        const result = await Supplier({
            id: idIndex,
            supplierName: data.supplierName,
            contactNames: data.contactNames,
            phones: data.phones,
            address: data.address,
            createdAt: date,
        }).save();

        if (result) {
            return { 
                success: true, 
                message: `Supplier was created...`,
                body: result,
            };
        }

        throw new Error('Couldn\'t create new supplier...');
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

        const findSupplier = await Supplier.findOne(
            { id: id }, 
            { id: 1 },
        ).exec();
        if (findSupplier) {
            const date = await validations.getDate();
            const result = await Supplier.updateOne(
                { id: id },
                { deleted: true, updatedAt: date },
                { upsert: true },
            ).exec();
            if (result.acknowledged === true) {
                const updatedResult = await Supplier.findOne(
                    { id: id }, 
                    {},
                ).exec();
                return { 
                    success: true, 
                    message: `Supplier with ID ${id} was deleted...`,
                    body: updatedResult,
                };
            }
        }
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
}