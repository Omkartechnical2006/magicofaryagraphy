const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    upiId: {
        type: String,
        default: 'merchant@upi'
    },
    upiName: {
        type: String,
        default: 'Magic Of Arya'
    },
    binanceWallet: {
        type: String,
        default: ''
    },
    binanceQrUrl: {
        type: String,
        default: '/images/binance-qr-placeholder.png' // You would upload a real QR
    },
    supportTelegramId: {
        type: String,
        default: 'course_marketer'
    },
    adminPassword: {
        type: String,
        default: 'admin123'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', settingsSchema);
