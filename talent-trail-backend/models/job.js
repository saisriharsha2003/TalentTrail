const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({

    jobTitle: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },

    location: {
        type: String
    },
    workType: {
        type: String,
        enum: ['Onsite', 'Remote', 'Hybrid', null],
        default: null
    },

    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Internship', 'Contract', null],
        default: null
    },

    experienceRequired: {
        type: String
    },

    numberOfOpenings: {
        type: Number,
        min: 1,
        default: null
    },

    salaryRange: {
        type: String
    },

    // ✅ NEW FIELDS
    role: {
        type: String
    },

    responsibilities: {
        type: String
    },

    skills: {
        type: [String],
        default: []
    },

    skillsNormalized: {
        type: [String],
        default: []
    },

    eligibleBatch: {
        type: String
    },

    jobCategory: {
        type: String
    },

    department: {
        type: String
    },

    applicationFor: {
        type: String,
        required: true
    },

    collegeApproved: {
        type: Boolean,
        default: false
    },

    recruiter: {
        type: Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);