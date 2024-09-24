const Customer = require('./costumers.mongo');

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
        const docs = await Customer.countDocuments();
        const newCustomer = {
            id: Number(docs),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
        }
        const result = await Customer.create({
            id: newCustomer.id,
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            email: newCustomer.email,
            phone: newCustomer.phone,
            address: newCustomer.address,
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