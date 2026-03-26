const mongoose = require('mongoose');
const { Schema } = mongoose;

const personalSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    fatherName: {
        type: String,
        required: true
    },
    motherName: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
});

module.exports = mongoose.model('Personal', personalSchema);