const mongoose = require('mongoose');
const { Schema } = mongoose;

const recruiterDetailSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        min: 1000000000,
        max: 9999999999
    },
    email: {
        type: String,
        required: true
    },
    linkedIn: {
        type: String,
        required: true
    },
    recruiter: {
        type: Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    }
});

module.exports = mongoose.model('RecruiterDetail', recruiterDetailSchema);