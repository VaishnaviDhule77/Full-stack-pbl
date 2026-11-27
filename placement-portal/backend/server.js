const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Student");
const Drive = require("./models/Drive");
const Application = require("./models/Application");

const app = express();

app.use(cors());
app.use(express.json());


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(error => console.log(error));


// 1. Register student
app.post("/api/students", async (req, res) => {
    try {
        const { name, email, phone, department, cgpa, skills } = req.body;

        if (!name || !email || !phone || !department || !skills ||
            cgpa === undefined || cgpa === "") {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const student = new Student({
            name,
            email,
            phone,
            department,
            cgpa,
            skills
        });

        await student.save();

        res.status(201).json({
            message: "Student registered successfully!",
            student
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered"
            });
        }

        res.status(500).json({
            message: "Error registering student"
        });
    }
});


// 2. Get student profile using email
app.get("/api/students/:email", async (req, res) => {
    try {
        const student = await Student.findOne({
            email: req.params.email.toLowerCase()
        });

        if (!student) {
            return res.status(404).json({
                message: "Student profile not found"
            });
        }

        res.json(student);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching student profile"
        });
    }
});


// 3. Get all placement drives
app.get("/api/drives", async (req, res) => {
    try {
        const drives = await Drive.find().sort({ lastDate: 1 });
        res.json(drives);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching placement drives"
        });
    }
});


// 4. Apply for a placement drive
app.post("/api/applications", async (req, res) => {
    try {
        const { studentEmail, driveId } = req.body;

        if (!studentEmail || !driveId) {
            return res.status(400).json({
                message: "Student email and drive ID are required"
            });
        }

        const student = await Student.findOne({
            email: studentEmail.toLowerCase()
        });

        if (!student) {
            return res.status(404).json({
                message: "Please register your student profile first"
            });
        }

        const drive = await Drive.findById(driveId);

        if (!drive) {
            return res.status(404).json({
                message: "Placement drive not found"
            });
        }

        if (new Date(drive.lastDate) < new Date()) {
            return res.status(400).json({
                message: "Application deadline has passed"
            });
        }

        const application = new Application({
            studentId: student._id,
            driveId: drive._id
        });

        await application.save();

        res.status(201).json({
            message: "Application submitted successfully!",
            application
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already applied for this drive"
            });
        }

        res.status(500).json({
            message: "Error submitting application"
        });
    }
});


// 5. Get student's application history
app.get("/api/applications/student/:email", async (req, res) => {
    try {
        const student = await Student.findOne({
            email: req.params.email.toLowerCase()
        });

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const applications = await Application.find({
            studentId: student._id
        })
            .populate("driveId")
            .sort({ appliedAt: -1 });

        res.json(applications);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching application history"
        });
    }
});


// 6. Admin: View all applications for a drive
app.get("/api/applications/drive/:driveId", async (req, res) => {
    try {
        const applications = await Application.find({
            driveId: req.params.driveId
        })
            .populate("studentId")
            .populate("driveId")
            .sort({ appliedAt: -1 });

        res.json(applications);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching applicants"
        });
    }
});


// 7. Admin: Update selection status
app.put("/api/applications/:id", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = ["Selected", "Not Selected"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid selection status"
            });
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json({
            message: "Selection status updated successfully!",
            application
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating selection status"
        });
    }
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});