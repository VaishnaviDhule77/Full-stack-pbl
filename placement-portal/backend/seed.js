require("dotenv").config();

const mongoose = require("mongoose");
const Drive = require("./models/Drive");

const drives = [
    {
        company: "TCS",
        jobRole: "Assistant System Engineer",
        location: "Pune",
        package: "3.5 LPA",
        eligibility: "Minimum 6 CGPA",
        lastDate: "2026-12-15"
    },
    {
        company: "Infosys",
        jobRole: "System Engineer",
        location: "Bangalore",
        package: "4 LPA",
        eligibility: "Minimum 6 CGPA",
        lastDate: "2026-12-20"
    },
    {
        company: "Wipro",
        jobRole: "Project Engineer",
        location: "Mumbai",
        package: "3.5 LPA",
        eligibility: "Minimum 6 CGPA",
        lastDate: "2026-12-25"
    },
    {
        company: "Capgemini",
        jobRole: "Analyst",
        location: "Pune",
        package: "4.5 LPA",
        eligibility: "Minimum 7 CGPA",
        lastDate: "2026-12-30"
    }
];

async function insertDrives() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Drive.deleteMany({});
        await Drive.insertMany(drives);

        console.log("Placement drives added successfully!");

        await mongoose.disconnect();

    } catch (error) {
        console.log("Error:", error);
        await mongoose.disconnect();
    }
}

insertDrives();