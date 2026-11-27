const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Appointment = require("./models/Appointment");

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT TO DATABASE
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// BOOK APPOINTMENT
app.post("/api/appointments", async (req, res) => {
    try {
        const { patientName, doctorName, date, timeSlot } = req.body;

        if (!patientName || !doctorName || !date || !timeSlot) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Validate date format and actual date
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: "Invalid date" });
        }

        const selectedDate = new Date(date + "T00:00:00Z");

if (
    isNaN(selectedDate.getTime()) ||
    selectedDate.toISOString().slice(0, 10) !== date
) {
    return res.status(400).json({
        message: "Invalid date. Please select a valid appointment date."
    });
}

        // Prevent past appointments
        const now = new Date();
        const today = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0");

        if (date < today) {
            return res.status(400).json({
                message: "Please select a future date"
            });
        }

        const appointment = new Appointment({
            patientName,
            doctorName,
            date,
            timeSlot
        });

        await appointment.save();

        res.status(201).json({
            message: "Appointment booked successfully!"
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This doctor's time slot is already booked!"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// DISPLAY UPCOMING APPOINTMENTS
app.get("/api/appointments", async (req, res) => {
    try {
        const now = new Date();
        const today = now.getFullYear() + "-" +
            String(now.getMonth() + 1).padStart(2, "0") + "-" +
            String(now.getDate()).padStart(2, "0");

        const appointments = await Appointment.find({
            date: { $gte: today }
        }).sort({ date: 1, timeSlot: 1 });

        res.json(appointments);

    } catch (error) {
        res.status(500).json({ message: "Unable to load appointments" });
    }
});

// START SERVER
app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");
});