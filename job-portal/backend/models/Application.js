const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    resumeLink: {
        type: String,
        required: true
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// One application per student email for each job
applicationSchema.index(
    { jobId: 1, email: 1 },
    { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);