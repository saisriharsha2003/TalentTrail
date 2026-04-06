const mongoose = require('mongoose');
const { Schema } = mongoose;

const appliedJobSchema = new Schema({
    companyName: {
        type: String,
        required: true
    },

    // 🔥 UPDATED FIELD
    jobTitle: {
        type: String,
        required: true
    },

    // 🔥 KEEP SIMPLE (string is fine for now)
    salary: {
        type: String,
        required: true
    },

    appliedOn: {
        type: Date,
        required: true,
        default: Date.now // ✅ auto-set
    },

    status: {
        type: String,
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

}, {
    timestamps: true // 🔥 bonus (createdAt, updatedAt)
});

module.exports = mongoose.model('AppliedJob', appliedJobSchema);