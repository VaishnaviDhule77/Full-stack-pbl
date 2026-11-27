const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        unique: true
    },
    member: String,
    issueDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Issue", issueSchema);