const mongoose = require('mongoose');
const { Schema } = mongoose;

const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String
    },
    currentlyWorking: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        required: true
    },
    associated: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
});

module.exports = mongoose.model('Project', projectSchema);