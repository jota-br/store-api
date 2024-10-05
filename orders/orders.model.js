const Order = require("./orders.mongo");
const Product = require("../products/products.mongo");
const Customer = require("../customers/costumers.mongo");

const productsModel = require("../products/products.model");
const customersModel = require("../customers/customers.model");

const { getNextId } = require("../idindex/id.index");
const validations = require("../services/validations");

async function getAllOrders() {
    try {
        const result = await Order.find({}, {}).populate("customer").exec();
        if (!result) {
            throw new Error(`Couldn\'t find Orders...`);
        }

        return {
            success: true,
            message: `Fetched all Orders...`,
            body: Array.isArray(result) ? result : [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function getOrderById(id) {
    try {
        let isValidString = await validations.validateString(id);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const result = await Order.findOne({ id: Number(id) })
            .populate("customer")
            .exec();
        if (!result) {
            throw new Error(`Couldn\'t return Order with ID ${id}`);
        }

        return {
            success: true,
            message: `Order with ID ${id} was found...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

async function addNewOrder(data) {
    try {
        let isValidString = await validations.validateString(data);
        if (!isValidString) {
            throw new Error(`Invalid character found...`);
        }

        const customerObject = await Customer.findOne({ id: data.customer }, { _id: 1 });
        if (!customerObject) {
            throw new Error("Ivalid Customer ID...");
        }

        let arrProductsId = [];
        let arrProductsQuantity = [];
        let arrProductCurrentStock = [];
        const products = await new Promise.all(data.map(async (product) => {
            const productObject = await Product.findOne({ id: product.id }, { _id: 1 });
            if (!productObject) {
                throw new Error("Invalid Product ID...");
            }

            const hasStock = await Product.findOne({ _id: productObject._id }, { stockQuantity: 1, name: 1 });

            if (hasStock.stockQuantity < product.quantity) {
                throw new Error(`Insuficient stock for Product ${hasStock.name}...`);
            }

            arrProductsId.push(productObject._id);
            arrProductsQuantity.push(product.quantity);
            arrProductCurrentStock.push(hasStock.stockQuantity);

            return {
                product: productObject._id,
                quantity: product.quantity,
                unitPrice: productObject.price,
                totalAmount: (productObject.price * product.quantity),
            };
        }));

        await new Promise.all(arrProductsId.map(async (productId) => {
            const index = Array.indexOf(productId);
            const stockResult = await Product.updateOne (
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
        await result.populate("product");
        return {
            success: true,
            message: `Order with ID ${id} was found...`,
            body: [result],
        };
    } catch (err) {
        console.error(err.message);
        return { success: false, message: err.message, body: [] };
    }
}

module.exports = {
    getAllOrders,
    getOrderById,
    addNewOrder,
};
