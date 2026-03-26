const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    collegeEmail: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        min: 1000000000,
        max: 9999999999
    },
    currentAddress: {
        type: String,
        required: true
    },
    permanentAddress: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    mobileVerified: {
        type: Boolean,
        default: false,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
});

module.exports = mongoose.model('Contact', contactSchema);