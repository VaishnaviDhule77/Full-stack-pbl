const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    studentName: String,
    score: Number,
    totalQuestions: Number,
    percentage: Number,
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Result", resultSchema);