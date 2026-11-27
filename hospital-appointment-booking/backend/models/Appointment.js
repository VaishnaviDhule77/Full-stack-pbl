const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    doctorName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    }
});

// Prevent duplicate doctor, date and time slot
appointmentSchema.index(
    { doctorName: 1, date: 1, timeSlot: 1 },
    { unique: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);