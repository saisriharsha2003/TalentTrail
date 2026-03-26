const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    applicationFor: {
        type: String,
        required: true
    },
    collegeApproved: {
        type: Boolean,
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    cgpa: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    description: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true,
        min: 1
    },
    package: {
        type: String,
        required: true
    },
    recruiter: {
        type: Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    }
});

module.exports = mongoose.model('Job', jobSchema);