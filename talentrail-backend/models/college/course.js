const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
    },
    college: {
        type: Schema.Types.ObjectId,
        ref: 'college'
    }
});

module.exports = mongoose.model('Course', courseSchema);