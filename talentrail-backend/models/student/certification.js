const mongoose = require('mongoose');
const { Schema } = mongoose;

const certificationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    organization: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
});

module.exports = mongoose.model('Certification', certificationSchema);