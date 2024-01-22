const jwt = require("jsonwebtoken");
const User = require("./models/User");

const socketServer = (server) => {
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    const connectedClients = {};
    io.use(function (socket, next) {
        //Authentication Logic.
        if (socket.handshake.query && socket.handshake.query.token) {
            console.log("ADsa");
            jwt.verify(socket.handshake.query.token, process.env.JwtEncryptionKey, function (err, decoded) {
                if (err) {
                    return next(new Error('Authentication error'));
                }

                console.log("decoded", decoded);
                socket.decoded = decoded;
                next();
            });
        }
        else {
            console.log("access Denied");
            next(new Error('Authentication error'));
        }
    })
        .on('connection', (socket) => {
            connectedClients[socket.decoded] = socket.id;

            socket.on('chat', async (PulseValue) => {
                // Update the user's database record with the new chat message
                try {
                    const user = await User.findOne({ _id: socket.decoded.userId });
                    if (user) {
                        user.Pulse = PulseValue

                        await user.save();
                        console.log('Chat message saved to the database');
                    } else {
                        console.log('User not found in the database');
                    }
                } catch (error) {
                    console.error('Error updating user chat messages:', error.message);
                }

                // Broadcast the chat message to all connected clients
                io.emit('Message', PulseValue);
            });

            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                delete connectedClients[socket.decoded];
            });

            socket.on('private-message', (data) => {
                const targetSocketId = data.targetSocketId;

                if (connectedClients[targetSocketId]) {
                    // Send a private message to the specified client if the User is connected
                    io.to(connectedClients[targetSocketId]).emit('private-message', {
                        from: socket.decoded,
                        message: data.message
                    });
                } else {
                    console.log(`Target socket not found: ${targetSocketId}`);
                }
            });
        });
};

module.exports = {
    socketServer,
};