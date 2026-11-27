const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Book = require("./models/Book");
const Issue = require("./models/Issue");

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT TO DATABASE
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ADD BOOK
app.post("/api/books", async (req, res) => {
    let book = new Book(req.body);
    await book.save();

    res.json({ message: "Book added successfully" });
});

// DISPLAY ALL BOOKS
app.get("/api/books", async (req, res) => {
    let books = await Book.find();
    res.json(books);
});

// ISSUE BOOK
app.post("/api/issue", async (req, res) => {
    let book = await Book.findOneAndUpdate(
        { _id: req.body.bookId, available: true },
        { available: false },
        { new: true }
    );

    if (!book) {
        return res.json({ message: "Book is already issued or not found" });
    }

    let issue = new Issue({
        bookId: book._id,
        member: req.body.member
    });

    await issue.save();

    res.json({ message: "Book issued successfully" });
});

// RETURN BOOK
app.post("/api/return", async (req, res) => {
    let issue = await Issue.findOneAndDelete({
        bookId: req.body.bookId
    });

    if (!issue) {
        return res.json({ message: "Book is not issued" });
    }

    await Book.findByIdAndUpdate(
        req.body.bookId,
        { available: true }
    );

    res.json({ message: "Book returned successfully" });
});

// DISPLAY ISSUED BOOKS
app.get("/api/issued", async (req, res) => {
    let issues = await Issue.find().populate("bookId");
    res.json(issues);
});

// START SERVER
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");
});