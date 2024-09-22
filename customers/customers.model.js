const Customer = required('./costumers.mongo');

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
    const docs = await Customer.countDocuments();
    const newCustomer = {
        id: Number(docs),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
    }
}