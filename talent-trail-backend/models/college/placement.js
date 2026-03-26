const mongoose = require('mongoose');
const { Schema } = mongoose;

const placementSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true,
        min: 1000000000,
        max: 9999999999
    },
    email: {
        type: String,
        required: true
    },
    college: {
        type: Schema.Types.ObjectId,
        ref: 'college'
    }
});

module.exports = mongoose.model('Placement', placementSchema);