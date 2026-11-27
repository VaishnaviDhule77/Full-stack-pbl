
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Transaction = require("./models/Transaction");

const app = express();

app.use(cors());
app.use(express.json());

// Get all transactions
app.get("/api/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions" });
    }
});

// Add a new transaction
app.post("/api/transactions", async (req, res) => {
    try {
        const { title, amount, type, category, date } = req.body;

        if (!title || !category || !date ||
            !["Income", "Expense"].includes(type) ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0) {
            return res.status(400).json({
                message: "Please enter valid transaction details"
            });
        }

        const transaction = new Transaction({
            title,
            amount,
            type,
            category,
            date
        });

        await transaction.save();

        res.status(201).json({
            message: "Transaction added successfully",
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: "Error adding transaction" });
    }
});

// Edit a transaction
app.put("/api/transactions/:id", async (req, res) => {
    try {
        const { title, amount, type, category, date } = req.body;

        if (!title || !category || !date ||
            !["Income", "Expense"].includes(type) ||
            !Number.isFinite(Number(amount)) ||
            Number(amount) <= 0) {
            return res.status(400).json({
                message: "Please enter valid transaction details"
            });
        }

        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { title, amount, type, category, date },
            { new: true, runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction updated successfully",
            transaction
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating transaction" });
    }
});

// Delete a transaction
app.delete("/api/transactions/:id", async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found"
            });
        }

        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting transaction" });
    }
});

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");

        app.listen(process.env.PORT, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });
