const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');

const initializeSocket = (server) => {
    const io = new Server(server, {
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
            console.log('=== Socket Authentication ===');
            console.log('Decoded token:', decoded);
            
            if (!decoded._id) {
                console.error('Invalid token: missing user ID');
                return next(new Error('Invalid token: missing user ID'));
            }
            
            const userId = decoded._id.toString();
            
            // Check if this socket is already authenticated with a different user
            if (socket.user && socket.user.userId !== userId) {
                console.error('Socket already authenticated with different user:', socket.user.userId);
                return next(new Error('Socket already authenticated'));
            }
            
            socket.user = { userId };
            console.log('Socket authenticated with user ID:', userId);
            next();
        } catch (err) {
            console.error('Token verification error:', err);
            next(new Error('Authentication error'));
        }
    };

    io.use(authenticateSocket);
    return io;
};

module.exports = initializeSocket; 