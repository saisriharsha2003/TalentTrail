const mongoose = require('mongoose');
const { Schema } = mongoose;

const appliedJobSchema = new Schema({
    companyName: {
        type: String,
        required: true
    },
    jobRole: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    appliedOn: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['selected', 'rejected', 'pending'],
        default: 'pending'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    }
});

module.exports = mongoose.model('AppliedJob', appliedJobSchema);