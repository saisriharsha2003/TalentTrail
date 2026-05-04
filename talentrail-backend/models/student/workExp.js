const mongoose = require('mongoose');
const { Schema } = mongoose;

const workExpSchema = new Schema({
    organization: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: String,
        required: true
    },
    endDate: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
});

module.exports = mongoose.model('WorkExp', workExpSchema);