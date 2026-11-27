
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Room = require("./models/Room");
const Student = require("./models/Student");

const app = express();

app.use(cors());
app.use(express.json());

// Add a new room
app.post("/api/rooms", async (req, res) => {
    try {
        const { roomNumber, capacity, roomType } = req.body;

        if (!roomNumber || !roomType ||
            !Number.isInteger(Number(capacity)) ||
            Number(capacity) < 1) {
            return res.status(400).json({
                message: "Please enter valid room details"
            });
        }

        const room = new Room({
            roomNumber,
            capacity: Number(capacity),
            roomType
        });

        await room.save();

        res.status(201).json({
            message: "Room added successfully",
            room
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Room number already exists"
            });
        }

        res.status(500).json({
            message: "Error adding room"
        });
    }
});

// Get rooms with occupied and vacant beds
app.get("/api/rooms", async (req, res) => {
    try {
        const rooms = await Room.find();

        const result = await Promise.all(
            rooms.map(async (room) => {
                const occupied = await Student.countDocuments({
                    roomId: room._id
                });

                return {
                    _id: room._id,
                    roomNumber: room.roomNumber,
                    capacity: room.capacity,
                    roomType: room.roomType,
                    occupied: occupied,
                    vacant: room.capacity - occupied,
                    status: occupied === 0
                        ? "Vacant"
                        : occupied >= room.capacity
                            ? "Full"
                            : "Partially Occupied"
                };
            })
        );

        res.json(result);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching rooms"
        });
    }
});

// Allocate student to a room
app.post("/api/allocate", async (req, res) => {
    try {
        const { name, email, roomId } = req.body;

        if (!name || !email || !roomId) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingStudent = await Student.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingStudent) {
            return res.status(409).json({
                message: "Student is already allocated"
            });
        }

        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        // Count occupied beds
        const occupied = await Student.countDocuments({
            roomId: roomId
        });

        // Check room capacity
        if (occupied >= room.capacity) {
            return res.status(400).json({
                message: "Room is full. Cannot allocate more students."
            });
        }

        // Save student allocation
        const student = new Student({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            roomId: roomId
        });

        await student.save();

        res.status(201).json({
            message: "Student allocated successfully",
            student
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Student is already allocated"
            });
        }

        res.status(500).json({
            message: "Error allocating student"
        });
    }
});

// Get all allocated students
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find()
            .populate("roomId", "roomNumber roomType");

        res.json(students);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching students"
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
