const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rollNo: {
        type: String
    },
    personal: {
        type: Schema.Types.ObjectId,
        ref: 'Personal'
    },
    contact: {
        type: Schema.Types.ObjectId,
        ref: 'Contact'
    },
    academic: {
        type: Schema.Types.ObjectId,
        ref: 'Academic'
    },
    workExperiences: [{
        type: Schema.Types.ObjectId,
        ref: 'WorkExp'
    }],
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    certifications: [{
        type: Schema.Types.ObjectId,
        ref: 'Certification'
    }],
    profile: {
        type: Buffer,
    },
    resume: {
        type: String,
    },
    jobsApplied: {
        type: Number,
        default: 0
    },
    jobsSelected: {
        type: Number,
        default: 0
    },
    jobsRejected: {
        type: Number,
        default: 0
    },
    applied: [{
        type: Schema.Types.ObjectId,
        ref: 'AppliedJob'
    }],
    role: {
        type: String,
        required: true,
        default: 'student',
        enum: ['student']
    },
    notification: [String],
    refreshToken: [String]
});

module.exports = mongoose.model('Student', studentSchema);