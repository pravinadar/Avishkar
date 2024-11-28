const mongoose = require('mongoose');

// Define Receipt schema
const receiptSchema = new mongoose.Schema({
    transactionId: String,
    customerName: String,
    products: [
        {
            productName: String,
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: Number,
    transactionDate: {
        type: Date,
        default: Date.now
    }
});

// Create a model
const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;
