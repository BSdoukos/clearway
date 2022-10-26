const mongoose = require('../db/mongoose.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(value)) {
                throw new Error('The provided e-mail is invalid.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    taskCompletionLogs: [{
        type: Date
    }],
    taskContexts: [{
        type: String,
        default: ['home', 'office', 'outdoors']
    }],
    notifyBeforeEvents: {
        type: Boolean,
        default: true
    },
    recoveryToken: {
        type: String
    }
});

userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ _id: this._id.toString() }, '@S^rz4ttaXC4', { expiresIn: '15 days' });

    if (!this.tokens) {
        this.tokens = [];
    }
    this.tokens.push({ token });
    
    await this.save();

    return token;
}

userSchema.methods.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.virtual('events', {
    ref: 'Event',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;