const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();

const Cart = require("../models/CartModelDB"); // Adjust the path to your Cart model
const CartProducts = require("../models/CartProductsModelDB"); // Adjust the path to your CartProducts model
const Order = require("../models/OrderModelDB"); // Adjust the path to your Cart model
const OrderProducts = require("../models/OrderProductsModelDB"); // Adjust the path to your CartProducts model
const OrderBilling = require("../models/OrderBillingModelDB"); // Adjust the path to your CartProducts model
const Product = require("../models/ProductsModelDB"); // Adjust the path to your Product model


// 1. Create Order Bill
router.post("/bill", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        const bill = new OrderBilling({
            userId: userId,
            orderId: req.body.orderId,
            name: req.body.name,
            phone1: req.body.phone1,
            phone2: req.body.phone2,
            flatNo: req.body.flatNo,
            floorNo: req.body.floorNo,
            buildingNo: req.body.buildingNo,
            street: req.body.street,
            city: req.body.city,
            details: req.body.details,
            totalCost: req.body.totalCost,
            paymentMethod: req.body.paymentMethod
        });

        await bill.save();
        res.status(200).send("Order bill created successfully");
    } catch (err) {
        console.error('Error:', err);  // Log the complete error for debugging
        res.status(400).send("Order bill failed. Please check the request data.");
    }
});

// 2. Create Order from Cart
router.post("/", async (req, res) => {
    const token = req.header("x-auth-token");

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        // Find the user's cart
        const cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        // Create a new order for the user
        const order = new Order({ userId: userId, order_status: "Waiting for Confirmation" });
        await order.save();

        // Find all cart products for the user's cart
        const cartProducts = await CartProducts.find({ cartId: cart.id });

        if (cartProducts.length === 0) {
            return res.status(400).send("No products in cart");
        }

        // Map cart products to order products and create them in bulk
        const orderProductsData = cartProducts.map(item => ({
            orderId: order.id,
            productId: item.productId._id,
            quantity: item.quantity
        }));

        await OrderProducts.insertMany(orderProductsData);

        // Optionally, you can clear the cart products after moving them to order products
        await CartProducts.deleteMany({ cartId: cart.id });

        return res.status(200).send("Order created and cart products moved successfully");
    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send("Order creation failed");
    }
});

//3. Get User's Latest Order with Billing Information
router.get('/latest', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        // Retrieve the latest order for the user
        const latestOrderBilling = await OrderBilling.findOne({ userId: userId })
            .sort({ createdAt: -1 })
            .populate('orderId'); // Populate the Order

        // Check if the latest order exists
        if (!latestOrderBilling) {
            return res.status(404).send('No orders found for the user');
        }

        // Retrieve order products related to the orderId
        const orderProducts = await OrderProducts.find({ orderId: latestOrderBilling.orderId })
            .populate({
                path: 'productId',  // Populate the productId in OrderProducts
                model: 'Product'
            });

        // Convert the orderBilling object to a plain JSON object
        const orderBillingJSON = latestOrderBilling.toObject();
        orderBillingJSON.orderId.orderProducts = orderProducts;  // Attach the products to the order

        // Process each orderProduct's img_url field and split it into an array
        orderBillingJSON.orderId.orderProducts = orderBillingJSON.orderId.orderProducts.map(orderProduct => {
            if (orderProduct.productId) {
                orderProduct.productId.img_urls = orderProduct.productId.img_url 
                    ? orderProduct.productId.img_url.split(',') 
                    : [];
            }
            return orderProduct;
        });

        // Return the latest order with billing information
        return res.status(200).json(orderBillingJSON);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send('Error retrieving latest order with billing');
    }
});


// 4. Get All Orders with Billing for User
router.get('/all', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        // Retrieve all orders for the user
        const ordersBilling = await OrderBilling.find({ userId: userId })
            .sort({ createdAt: -1 })
            .populate('orderId'); // Populate the Order

        if (!ordersBilling || ordersBilling.length === 0) {
            return res.status(404).send('No orders found for the user');
        }

        // Map through each orderBilling, and for each one, find its corresponding orderProducts
        const ordersData = await Promise.all(ordersBilling.map(async orderBilling => {
            const orderBillingJSON = orderBilling.toObject();

            // Retrieve order products for this orderId
            const orderProducts = await OrderProducts.find({ orderId: orderBilling.orderId })
                .populate({
                    path: 'productId',  // Populate the productId in OrderProducts
                    model: 'Product'
                });

            // Attach order products to the order
            orderBillingJSON.orderId.orderProducts = orderProducts;

            // Process each orderProduct's img_url field and split it into an array
            orderBillingJSON.orderId.orderProducts = orderBillingJSON.orderId.orderProducts.map(orderProduct => {
                if (orderProduct.productId) {
                    orderProduct.productId.img_urls = orderProduct.productId.img_url 
                        ? orderProduct.productId.img_url.split(',') 
                        : [];
                }
                return orderProduct;
            });

            return orderBillingJSON;
        }));

        // Return all orders with billing information
        return res.status(200).json(ordersData);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send('Error retrieving orders');
    }
});


// 5. Get Order Billing Details by ID
router.get('/:id', async (req, res) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedPayload.userid;

        // Fetch order billing with the specific order ID and user
        const orderBilling = await OrderBilling.findOne({
            orderId: req.params.id,
            userId: userId
        }).populate('orderId'); // Populate the Order

        // If no order is found, return 404
        if (!orderBilling) {
            return res.status(404).send('No order found for this ID');
        }

        // Convert the orderBilling object to a plain JSON object
        const orderBillingJSON = orderBilling.toObject();

        // Retrieve order products for the specific orderId
        const orderProducts = await OrderProducts.find({ orderId: req.params.id })
            .populate({
                path: 'productId', // Populate the productId in OrderProducts
                model: 'Product'
            });

        // Attach order products to the orderId
        orderBillingJSON.orderId.orderProducts = orderProducts;

        // Process each orderProduct's img_url field and split it into an array
        orderBillingJSON.orderId.orderProducts = orderBillingJSON.orderId.orderProducts.map(orderProduct => {
            if (orderProduct.productId) {
                orderProduct.productId.img_urls = orderProduct.productId.img_url 
                    ? orderProduct.productId.img_url.split(',') 
                    : [];
            }
            return orderProduct;
        });

        // Return the processed order with billing data
        return res.status(200).json(orderBillingJSON);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(400).send('Error retrieving order');
    }
});

module.exports = router;