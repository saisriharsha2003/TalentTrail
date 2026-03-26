const mongoose = require('mongoose');
const { Schema } = mongoose;

const currentEducationSchema = new Schema({
    college: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    joinDate: {
        type: String,
        required: true
    },
    graduatingYear: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    studyYear: {
        type: Number,
        required: true
    },
    major: {
        type: String,
        required: true
    },
    skills: [{
        type: String,
        required: true
    }],
    interests: [{
        type: String,
        required: true
    }],
    cgpa: {
        type: Number,
        required: true,
        max: 10,
        min: 1
    }
});

const previousEducationSchema = new Schema({
    college: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    major: {
        type: String,
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    }
});

const academicSchema = new Schema({
    currentEducation: currentEducationSchema,
    previousEducation: previousEducationSchema,
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
});

module.exports = mongoose.model('Academic', academicSchema);