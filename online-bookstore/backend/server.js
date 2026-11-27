const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Book = require("./models/Book");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ADD SAMPLE BOOKS
app.get("/api/addbooks", async (req, res) => {
    let count = await Book.countDocuments();

    if (count === 0) {
        await Book.insertMany([
            { title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography", price: 250 },
            { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", price: 200 },
            { title: "Atomic Habits", author: "James Clear", category: "Self Help", price: 350 },
            { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", category: "Finance", price: 300 },
            { title: "Harry Potter", author: "J.K. Rowling", category: "Fiction", price: 400 }
        ]);
    }

    res.send("Sample books are ready!");
});
// GET BOOKS AND FILTER BY CATEGORY
app.get("/api/books", async (req, res) => {
    let category = req.query.category;

    let books;

    if (category) {
        books = await Book.find({ category: category });
    } else {
        books = await Book.find();
    }

    res.json(books);
});

// PLACE ORDER
app.post("/api/orders", async (req, res) => {
    let items = req.body.items;
    let total = 0;

    for (let item of items) {
        let book = await Book.findById(item.bookId);

        if (!book || !Number.isInteger(item.quantity) || item.quantity < 1) {
            return res.status(400).json({ message: "Invalid order item" });
        }

        total += book.price * item.quantity;

        item.title = book.title;
        item.price = book.price;
    }

    let order = new Order({
        items: items,
        total: total
    });

    await order.save();

    res.json({ message: "Order placed successfully!" });
});

// START SERVER
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");
});