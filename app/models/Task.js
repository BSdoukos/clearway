const mongoose = require('../db/mongoose.js');

function checkValueInGroup(group, value) {
    if (!group.includes(value)) {
        throw new Error();
    }
}

const taskSchema = mongoose.Schema({
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
    hours: {
        type: Number,
        required: true,
        trim: true
    },
    minutes: {
        type: Number,
        required: true,
        trim: true
    },
    context: {
        type: String,
        required: true
    },
    energy: {
        type: String,
        required: true,
        validate(value) {
            checkValueInGroup(['low', 'medium', 'high'], value);
        }
    },
    importance: {
        type: String,
        required: true,
        validate(value) {
            checkValueInGroup(['main', 'side'], value);
        }
    },
    recurrence: {
        type: String,
        required: true,
        validate(value) {
            checkValueInGroup(['one time', 'daily', 'weekly', 'monthly', 'yearly'], value);
        }
    },
    deadline: {
        type: Date,
    },
    completed: [
        { type: String }
    ],
    deleted: [
        { type: String }
    ],
    runEvery: {
        type: String
    },
    creationDate: {
        type: Date,
        default: new Date()
    },
    isInactive: {
        type: Boolean,
        default: false
    },
    projectRelated: {
        type: String
    },
    owner: {
        type: String,
        required: true
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;