const mongoose = require('../db/mongoose.js');

const projectSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    deadline: {
        type: String,
        required: true,
        trim: true
    },
    flow: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!['parallel', 'sequential'].includes(value)) {
                throw new Error();
            }
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    completionPercentage: {
        type: Number,
        default: 0
    },
    owner: {
        type: String,
        required: true
    },
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;