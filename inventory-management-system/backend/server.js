const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Product = require("./models/Product");

const app = express();

app.use(cors());
app.use(express.json());


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(error => console.log("MongoDB Error:", error));


// 1. Add a product
app.post("/api/products", async (req, res) => {
    try {
        const { name, quantity, price, supplier } = req.body;

        if (!name || !supplier || quantity === undefined || price === undefined ||
            !Number.isInteger(Number(quantity)) || Number(quantity) < 0 ||
            !Number.isFinite(Number(price)) || Number(price) < 0) {

            return res.status(400).json({
                message: "Enter valid product details"
            });
        }

        const product = new Product({
            name,
            quantity: Number(quantity),
            price: Number(price),
            supplier
        });

        await product.save();

        res.status(201).json({
            message: "Product added successfully",
            product
        });

    } catch (error) {
        res.status(500).json({ message: "Error adding product" });
    }
});


// 2. Display all products
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1 });
        res.json(products);

    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
});


// 3. Update a product
app.put("/api/products/:id", async (req, res) => {
    try {
        const { name, quantity, price, supplier } = req.body;

        if (!name || !supplier || quantity === undefined || price === undefined ||
            !Number.isInteger(Number(quantity)) || Number(quantity) < 0 ||
            !Number.isFinite(Number(price)) || Number(price) < 0) {

            return res.status(400).json({
                message: "Enter valid product details"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                quantity: Number(quantity),
                price: Number(price),
                supplier
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        res.status(500).json({ message: "Error updating product" });
    }
});


// 4. Delete a product
app.delete("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({ message: "Product deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Error deleting product" });
    }
});


// 5. Calculate total inventory value
app.get("/api/inventory-value", async (req, res) => {
    try {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalValue: {
                        $sum: {
                            $multiply: ["$quantity", "$price"]
                        }
                    }
                }
            }
        ]);

        const totalValue = result.length > 0 ? result[0].totalValue : 0;

        res.json({
            totalInventoryValue: totalValue
        });

    } catch (error) {
        res.status(500).json({
            message: "Error calculating inventory value"
        });
    }
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});