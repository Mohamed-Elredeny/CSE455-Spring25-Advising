const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let ioInstance = null;

function initializeSocket(server) {
    ioInstance = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Middleware to verify socket authentication
    const authenticateSocket = (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            if (!decoded._id) {
                return next(new Error('Invalid token: missing user ID'));
            }
            const userId = decoded._id.toString();
            socket.user = { userId };
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    };

    ioInstance.use(authenticateSocket);
    return ioInstance;
}

function getIO() {
    if (!ioInstance) {
        throw new Error('Socket.io not initialized!');
    }
    return ioInstance;
}

module.exports = { initializeSocket, getIO }; 