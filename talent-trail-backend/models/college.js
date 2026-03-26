const mongoose = require('mongoose');
const { Schema } = mongoose;

const collegeSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    institution: {
        type: Schema.Types.ObjectId,
        ref: 'Institution'
    },
    principal: {
        type: Schema.Types.ObjectId,
        ref: 'Principal'
    },
    placement: {
        type: Schema.Types.ObjectId,
        ref: 'Placement'
    },
    programs: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    logo: {
        type: Buffer
    },
    role: {
        type: String,
        required: true,
        default: 'college',
        enum: ['college']
    },
    notification: [String],
    refreshToken: [String]
});

module.exports = mongoose.model('College', collegeSchema);