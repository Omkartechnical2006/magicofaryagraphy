const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['upi', 'card']
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'expired'],
        default: 'pending'
    },
    // UPI payment details
    upiTransactionId: {
        type: String,
        default: null
    },
    upiPaymentLink: {
        type: String,
        default: null
    },
    // Card payment details
    cardDetails: {
        cardNumber: String,
        cardHolderName: String,
        expiryDate: String,
        cvv: String
    },
    // Timer expiry
    expiresAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
