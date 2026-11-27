const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const MenuItem = require("./models/MenuItem");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(error => console.log(error));


// 1. Get all menu items
app.get("/api/menu", async (req, res) => {
    try {
        const menu = await MenuItem.find();
        res.json(menu);

    } catch (error) {
        res.status(500).json({ message: "Error loading menu" });
    }
});


// 2. Place an order
app.post("/api/orders", async (req, res) => {
    try {
        const { customerName, phone, items } = req.body;

        if (!customerName || !phone || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Please enter your details and select food items"
            });
        }

        // Validate quantities and fetch real menu prices
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
                return res.status(400).json({
                    message: "Invalid item quantity"
                });
            }

            const food = await MenuItem.findById(item.menuItemId);

            if (!food) {
                return res.status(404).json({
                    message: "Food item not found"
                });
            }

            orderItems.push({
                name: food.name,
                price: food.price,
                quantity: quantity
            });

            totalAmount += food.price * quantity;
        }

        const order = new Order({
            customerName,
            phone,
            items: orderItems,
            totalAmount
        });

        await order.save();

        res.status(201).json({
            message: "Order placed successfully!",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Error placing order"
        });
    }
});


// 3. Get order history
app.get("/api/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Error loading order history"
        });
    }
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});