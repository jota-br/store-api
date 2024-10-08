const Order = require("./orders.mongo");
const Customer = require("./customers.mongo");
const Product = require("./products.mongo");

const { getNextId } = require("../idindex/id.index");
const helpers = require("../utils/helpers");
const functionTace = require("../utils/logger");

async function getAllOrders() {
    try {
        const startTime = await functionTace.executionTime(false, false);
        const result = await Order.find({}, {})
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
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Fetched all Orders...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function getOrderById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Order.findOne({ id: Number(id) })
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
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Order with ID ${id} was found...`,
            body: [result],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function addNewOrder(productsInput, customer) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let validate = {
            order: productsInput,
            customer: customer,
        }

        let isValidString = await helpers.validateString(validate);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const customerObject = await Customer.findOne({ id: customer }, { _id: 1 });
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
            const stockResult = await Product.updateOne(
                { _id: productId },
                { stockQuantity: (arrProductCurrentStock[index] - arrProductsQuantity[index]) }
            );

            if (!stockResult.acknowledged) {
                throw new Error("Couldn\'t reduce stock...");
            }
        }));

        const idIndex = await getNextId("orderId");
        const date = await helpers.getDate();
        const totalOrderAmount = products.reduce((sum, item) => sum + item.totalAmount, 0);

        const result = await Order({
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
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Order with ID ${result.id} was created successfully...`,
            body: [result],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

async function cancelOrderById(id) {
    try {
        const startTime = await functionTace.executionTime(false, false);
        let isValidString = await helpers.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const orderExists = Order.findOne({ id: id }, { id: 1 });

        if (!orderExists) {
            throw new Error(`Couldn\'t find Order with ID ${id}...`);
        }

        const date = await helpers.getDate();
        const result = await Order.updateOne(
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
        functionTace.functionTraceEmit(execTime);

        return {
            success: true,
            message: `Order with ID ${id} was deleted...`,
            body: [],
        };
    } catch (err) {
        const returnError = await helpers.errorHandler(err);
        return returnError;
    }
}

module.exports = {
    getAllOrders,
    getOrderById,
    addNewOrder,
    cancelOrderById,
};
