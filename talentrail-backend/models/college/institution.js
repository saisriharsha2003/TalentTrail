const mongoose = require('mongoose');
const { Schema } = mongoose;

const institutionSchema = new Schema({
    name: {
        type: String,
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
    college: {
        type: Schema.Types.ObjectId,
        ref: 'college'
    }
});

module.exports = mongoose.model('Institution', institutionSchema);