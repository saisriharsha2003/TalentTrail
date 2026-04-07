const mongoose = require('mongoose');
const { Schema } = mongoose;

const appliedJobSchema = new Schema({
    companyName: {
        type: String,
        required: true
    },

    jobTitle: {
        type: String,
        required: true
    },

    salary: {
        type: String,
        required: true
    },

    appliedOn: {
        type: Date,
        required: true,
        default: Date.now 
    },

    status: {
        type: String,
        enum: ['selected', 'rejected', 'pending'],
        default: 'pending'
    },

    applicationId: {
        type: String,
        unique: true,
        required: true
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
    timestamps: true 
});

appliedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
appliedJobSchema.index({ userId: 1 });

module.exports = mongoose.model('AppliedJob', appliedJobSchema);
