const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    driveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Drive",
        required: true
    },
    status: {
        type: String,
        enum: ["Applied", "Selected", "Not Selected"],
        default: "Applied"
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate applications for the same drive
applicationSchema.index(
    { studentId: 1, driveId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);