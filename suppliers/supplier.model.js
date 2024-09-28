const Supplier = require('./supplier.mongo');

const { getNextId } = require('../idindex/id.index');
const validations = require('../services/validations');

async function getAllSuppliers() {
    try {
        return await Supplier.find({}, {}).exec();
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getSuppliersById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Supplier.findOne({ id: id }).exec();
        if (result) {
            return result;
        }

        throw new Error(`Couldn\'t return supplier with id: ${id}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function getSupplierByName(name) {
    try {
        let isValidString = await validations.validateString(name);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Supplier.find({ 
            name: new RegExp(name.split(' ').join('|'), 'i') 
        }).exec();

        if (result) {
            return result;
        }

        throw new Error(`Couldn\'t return supplier with name: ${name}`);
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

async function addNewSupplier(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
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
            return result;
        }

        throw new Error('Couldn\'t create new supplier...');
    } catch (err) {
        console.error(err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    getAllSuppliers,
    getSuppliersById,
    getSupplierByName,
    addNewSupplier,
}