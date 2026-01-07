const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        required: true,
        enum: ['mentalism', 'hypnosis', 'magic', 'live', 'workshop', 'bundle']
    },
    image: {
        type: String,
        required: true
    },
    features: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', courseSchema);
