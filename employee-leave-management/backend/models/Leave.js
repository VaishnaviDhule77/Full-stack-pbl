const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
    employeeName: String,
    leaveType: String,
    startDate: String,
    endDate: String,
    reason: String,

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    appliedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Leave", leaveSchema);