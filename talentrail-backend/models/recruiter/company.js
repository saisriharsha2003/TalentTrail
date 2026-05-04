const mongoose = require('mongoose');
const { Schema } = mongoose;

const companySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    industry: {
        type: String,
        required: true
    },
    logo: {
        type: Buffer
    },
    size: {
        type: Number,
        required: true
    },
    website: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        min: 1000000000,
        max: 9999999999
    },
    overview: {
        type: String,
        required: true
    },
    recruiter: {
        type: Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    }
});

module.exports = mongoose.model('Company', companySchema);