
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Registration = require("./models/Registration");

const app = express();

app.use(cors());
app.use(express.json());

// Get all registrations (Admin API)
app.get("/api/registrations", async (req, res) => {
    try {
        const registrations = await Registration.find()
            .sort({ registeredAt: -1 });

        res.json(registrations);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching registrations"
        });
    }
});

// Register a participant
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, mobile, event } = req.body;

        // Check required fields
        if (!name || !email || !mobile || !event) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email"
            });
        }

        // Check mobile number
        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                message: "Mobile number must contain 10 digits"
            });
        }

        // Check duplicate email
        const existingUser = await Registration.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        // Save registration
        const registration = new Registration({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobile,
            event
        });

        await registration.save();

        res.status(201).json({
            message: "Registration successful!",
            registration
        });

    } catch (error) {
        // Handle duplicate email even if two requests arrive together
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        res.status(500).json({
            message: "Error during registration"
        });
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
    .catch(error => {
        console.log("MongoDB connection error:", error);
    });
