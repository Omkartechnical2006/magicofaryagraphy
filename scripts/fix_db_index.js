const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ Connected to DB');
        try {
            console.log('Attempting to drop slug_1 index from courses collection...');
            await mongoose.connection.collection('courses').dropIndex('slug_1');
            console.log('✅ Successfully dropped slug_1 index!');
        } catch (error) {
            if (error.code === 27) {
                console.log('ℹ️ Index not found (already dropped).');
            } else {
                console.error('❌ Error dropping index:', error.message);
            }
        }
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection error:', err);
        process.exit(1);
    });
