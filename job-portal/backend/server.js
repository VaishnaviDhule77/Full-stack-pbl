const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Job = require("./models/Job");
const Application = require("./models/Application");

const app = express();

app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(error => console.log(error));


// 1. Recruiter: Post a new job
app.post("/api/jobs", async (req, res) => {
    try {
        const { title, company, location, description, eligibility } = req.body;

        if (!title || !company || !location || !description || !eligibility) {
            return res.status(400).json({
                message: "Please fill all job details"
            });
        }

        const job = new Job({
            title,
            company,
            location,
            description,
            eligibility
        });

        await job.save();

        res.status(201).json({
            message: "Job posted successfully",
            job
        });

    } catch (error) {
        res.status(500).json({ message: "Error posting job" });
    }
});


// 2. Students: View and search jobs
app.get("/api/jobs", async (req, res) => {
    try {
        const search = req.query.search || "";

        const jobs = await Job.find({
            $or: [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ]
        }).sort({ postedAt: -1 });

        res.json(jobs);

    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs" });
    }
});


// 3. Student: Apply for a job
app.post("/api/applications", async (req, res) => {
    try {
        const { jobId, studentName, email, phone, resumeLink } = req.body;

        if (!jobId || !studentName || !email || !phone || !resumeLink) {
            return res.status(400).json({
                message: "Please fill all application details"
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const existingApplication = await Application.findOne({
            jobId,
            email: email.toLowerCase()
        });

        if (existingApplication) {
            return res.status(409).json({
                message: "You have already applied for this job"
            });
        }

        const application = new Application({
            jobId,
            studentName,
            email,
            phone,
            resumeLink
        });

        await application.save();

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already applied for this job"
            });
        }

        res.status(500).json({ message: "Error submitting application" });
    }
});


// 4. Recruiter: View all applications
app.get("/api/applications", async (req, res) => {
    try {
        const applications = await Application.find()
            .populate("jobId", "title company location")
            .sort({ appliedAt: -1 });

        res.json(applications);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching applications"
        });
    }
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});