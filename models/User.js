const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String, required: true, lowercase: true, validate: {
            validator: function (value) {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                return emailRegex.test(value);
            },
            message: props => `${props.value} is not a valid email address!`,
        },
    },
    password: { type: String, required: true }
    ,
    Pulse: { type: Number },

    // time stamping
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) {
        return next();
    }

    const passwordRegex = /^(?=(.*\d){1,})(?=(.*\W){1,})(?!.*\s).{8,20}$/;
    if (!passwordRegex.test(this.password)) {
        const error = new Error('Password contain one lowercase letter, one uppercase letter, one numberic character and one special');
        return next(error);
    }

    try {
        // hashing the password with 10 salt rounds
        const hashedpassword = await bcrypt.hash(this.password, 10);

        // Replace the plain password with the hashed one
        this.password = hashedpassword;
        next();
    } catch (error) {
        next(error);
    }
});

// userSchema.post("")


const User = mongoose.model('User', userSchema);

module.exports = User;
