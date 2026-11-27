const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Complaint = require("./models/Complaint");

const app = express();

app.use(cors());
app.use(express.json());


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(error => console.log(error));


// 1. Submit a new complaint
app.post("/api/complaints", async (req, res) => {
    try {
        const { name, email, category, priority, description } = req.body;

        if (!name || !email || !category || !priority || !description) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const complaint = new Complaint({
            name,
            email,
            category,
            priority,
            description
        });

        await complaint.save();

        res.status(201).json({
            message: "Complaint submitted successfully!",
            complaint
        });

    } catch (error) {
        res.status(500).json({
            message: "Error submitting complaint"
        });
    }
});


// 2. Get complaints with optional status filter
app.get("/api/complaints", async (req, res) => {
    try {
        const filter = {};

        if (req.query.status && req.query.status !== "All") {
            filter.status = req.query.status;
        }

        const complaints = await Complaint.find(filter)
            .sort({ createdAt: -1 });

        res.json(complaints);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching complaints"
        });
    }
});


// 3. Update complaint status
app.put("/api/complaints/:id", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ["Open", "In Progress", "Resolved"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid complaint status"
            });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        res.json({
            message: "Complaint status updated successfully!",
            complaint
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating complaint"
        });
    }
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});