const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Leave = require("./models/Leave");

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT TO DATABASE
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// APPLY FOR LEAVE
app.post("/api/leaves", async (req, res) => {
    let { employeeName, leaveType, startDate, endDate, reason } = req.body;

    // CHECK EMPTY FIELDS
    if (!employeeName || !leaveType || !startDate || !endDate || !reason) {
        return res.status(400).json({
            message: "Please fill all fields"
        });
    }

    // CHECK DATE FORMAT
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({
            message: "Invalid date format"
        });
    }

    // CHECK VALID DATES
    let today = new Date().toLocaleDateString("en-CA");

    let start = new Date(startDate + "T00:00:00Z");
    let end = new Date(endDate + "T00:00:00Z");

    if (isNaN(start.getTime()) || isNaN(end.getTime()) ||
        start.toISOString().slice(0, 10) !== startDate ||
        end.toISOString().slice(0, 10) !== endDate) {
        return res.status(400).json({
            message: "Invalid dates"
        });
    }

    if (startDate < today || endDate < startDate) {
        return res.status(400).json({
            message: "Please select valid dates"
        });
    }

    if (!["Casual", "Sick", "Earned"].includes(leaveType)) {
        return res.status(400).json({
            message: "Invalid leave type"
        });
    }

    // SAVE LEAVE REQUEST
    let leave = new Leave({
        employeeName,
        leaveType,
        startDate,
        endDate,
        reason
    });

    await leave.save();

    res.json({
        message: "Leave application submitted successfully!"
    });
});

// DISPLAY ALL LEAVE REQUESTS
app.get("/api/leaves", async (req, res) => {
    let leaves = await Leave.find().sort({ appliedAt: -1 });
    res.json(leaves);
});

// APPROVE OR REJECT LEAVE
app.patch("/api/leaves/:id", async (req, res) => {
    let status = req.body.status;

    if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
            message: "Invalid status"
        });
    }

    let leave = await Leave.findByIdAndUpdate(
        req.params.id,
        { status: status },
        { new: true }
    );

    if (!leave) {
        return res.status(404).json({
            message: "Leave request not found"
        });
    }

    res.json({
        message: "Leave " + status.toLowerCase() + " successfully!"
    });
});

// START SERVER
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");
});