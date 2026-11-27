const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    cgpa: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    skills: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Student", studentSchema);