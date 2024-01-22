
const express = require('express');
const app = express();
const http = require('http');
const jwt = require('jsonwebtoken');
const User = require("./models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

app.use(express.json());

const server = http.createServer(app);

const { socketServer } = require("./socketServer");

require("dotenv").config();
const Port = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;


const jwtKey = process.env.JwtEncryptionKey;
console.log(jwtKey);

const generateToken = (user) => {
    console.log(user);
    return jwt.sign(
        {
            userId: user._id,
            userEmail: user.email
        },
        jwtKey,
        { expiresIn: '1d' }
    );
};


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err.message);
    });

app.use("/login", async (req, res) => {

    try {
        const Email = req.body?.email;
        const Password = req.body?.password;
        let user = await User.findOne({ email: Email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(Password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const token = generateToken(user);
        return res.status(200).json({ success: true, message: 'Login successful', token });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to login', error: err.message });
    }
});
//initialize app
// add your middlewares and routing

// Socket Server
socketServer(server);

server.listen(Port, () => {
    console.log(`Server is listening on ${Port}`);
});