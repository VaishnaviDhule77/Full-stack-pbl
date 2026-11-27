const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    package: {
        type: String,
        required: true
    },
    eligibility: {
        type: String,
        required: true
    },
    lastDate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("Drive", driveSchema);