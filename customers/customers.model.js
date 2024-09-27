const Customer = require('./costumers.mongo');

const { getNextId } = require('../idindex/id.index');

async function getAllCustomers() {
    try {
        return await Customer.find({}, {}).exec();
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function getCustomersById(id) {
    try {
        const result = await Customer.findOne({ id: Number(id) });
        if (result) {
            return result;
        }
        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

async function addNewCustomer(data) {
    try {
        const idIndex = await getNextId('customerId');
        const result = await Customer.create({
            id: idIndex,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
        });
        if (result) {
            return result;
        }
        throw new Error('Something went wrong...');
    } catch (err) {
        console.error(err);
        return err.message;
    }
}

module.exports = {
    getAllCustomers,
    getCustomersById,
    addNewCustomer,
}