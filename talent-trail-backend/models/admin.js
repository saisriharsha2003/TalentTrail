const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        type: Buffer
    },
    role: {
        type: String,
        required: true,
        default: 'admin',
        enum: ['admin']
    },
    notification: [String],
    refreshToken: [String]
});

module.exports = mongoose.model('Admin', adminSchema);