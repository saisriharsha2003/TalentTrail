const mongoose = require('mongoose');
const { Schema } = mongoose;

const recruiterSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    recruiterDetail: {
        type: Schema.Types.ObjectId,
        ref: 'RecruiterDetail'
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    role: {
        type: String,
        default: 'recruiter',
        requried: true,
        enum: ['recruiter']
    },
    notification: [String],
    refreshToken: [String]
});

module.exports = mongoose.model('Recruiter', recruiterSchema);