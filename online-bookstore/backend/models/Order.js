const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    items: [
        {
            bookId: mongoose.Schema.Types.ObjectId,
            title: String,
            price: Number,
            quantity: Number
        }
    ],
    total: Number,
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);