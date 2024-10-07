const Models = require("./mongo.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../utils/validations");
const functionTace = require("../utils/function.trace");

async function getAllOrders() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Models.Order.find({}, {})
        .populate("customer")
            .populate({
                path: 'products.product',
                model: 'Product',
            })
            .exec();
            if (!result) {
                throw new Error(`Couldn\'t find Orders...`);
            }
            
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getAllOrders', null, execTime);

        return {
            success: true,
            message: `Fetched all Orders...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getAllOrders', null, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getOrderById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        
        const result = await Models.Order.findOne({ id: Number(id) })
            .populate("customer")
            .populate({
                path: 'products.product',
                model: 'Product',
            })
            .exec();
            if (!result) {
                throw new Error(`Couldn\'t return Order with ID ${id}`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('getOrderById', id, execTime);

        return {
            success: true,
            message: `Order with ID ${id} was found...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('getOrderById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewOrder(productsInput, customer) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let validate = {
            order: productsInput,
            customer: customer,
        }
        
        let isValidString = await validations.validateString(validate);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        
        const customerObject = await Models.Customer.findOne({ id: customer }, { _id: 1 });
        if (!customerObject) {
            throw new Error("Ivalid Customer ID...");
        }

        let arrProductsId = [];
        let arrProductsQuantity = [];
        let arrProductCurrentStock = [];
        
        const products = await Promise.all(productsInput.map(async (product) => {
            const productObject = await Product.findOne({ id: product.productId }, { _id: 1, stockQuantity: 1, name: 1, price: 1 });
            if (!productObject) {
                throw new Error("Invalid Product ID...");
            }

            if (productObject.stockQuantity < product.quantity) {
                throw new Error(`Insuficient stock for Product ${productObject.name}...`);
            }

            arrProductsId.push(productObject._id);
            arrProductsQuantity.push(product.quantity);
            arrProductCurrentStock.push(productObject.stockQuantity);
            
            
            return {
                product: productObject._id,
                quantity: product.quantity,
                unitPrice: productObject.price,
                totalAmount: (productObject.price * product.quantity),
            };
        }));

        await Promise.all(arrProductsId.map(async (productId) => {
            const index = arrProductsId.indexOf(productId);
            const stockResult = await Models.Product.updateOne (
                { _id: productId },
                { stockQuantity: (arrProductCurrentStock[index] - arrProductsQuantity[index]) }
            );

            if (!stockResult.acknowledged) {
                throw new Error("Couldn\'t reduce stock...");
            }
        }));

        const idIndex = await getNextId("orderId");
        const date = await validations.getDate();
        const totalOrderAmount = products.reduce((sum, item) => sum + item.totalAmount, 0);

        const result = await Models.Order({
            id: idIndex,
            customer: customerObject._id,
            products: products,
            totalOrderAmount: totalOrderAmount,
            orderDate: date,
        }).save();

        if (!result) {
            throw new Error("Couldn\'t create new order...");
        }
        
        await result.populate("customer");
        await result.populate({
            path: 'products.product',
            model: 'Product',
        });

        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('addNewOrder', {productsInput, customer}, execTime);

        return {
            success: true,
            message: `Order with ID ${result.id} was created successfully...`,
            body: [result],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('addNewOrder', { productsInput, customer }, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function cancelOrderById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }
        
        const orderExists = Models.Order.findOne({ id: id }, { id: 1 });

        if (!orderExists) {
            throw new Error(`Couldn\'t find Order with ID ${id}...`);
        }
        
        const date = await validations.getDate();
        const result = await Models.Order.updateOne(
            { id: id },
            { 
                canceled: true,
                updatedAt: date,
            },
            { upsert: true },
        );
        
        if (!result.acknowledged) {
            throw new Error(`Couldn\'t delete Order with ID ${id}...`);
        }
        
        const execTime = await functionTace.executionTime(startTime, false);
        functionTace.functionTraceEmit('cancelOrderById', id, execTime);

        return {
            success: true,
            message: `Order with ID ${id} was deleted...`,
            body: [],
        };
    } catch (err) {
        functionTace.functionTraceEmitError('cancelOrderById', id, err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllOrders,
    getOrderById,
    addNewOrder,
    cancelOrderById,
};
