const mongoose = require('../db/mongoose.js');

const eventSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true,
        trim: true
    },
    recurrence: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    runEvery: {
        type: String
    },
    completed: [{
        type: String
    }],
    deleted: [{
        type: String
    }],
    owner: {
        type: String,
        required: true
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;