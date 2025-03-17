const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server({});
let onlineUsers = [];

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    socket.on('addNewUser', (userId) => {
        !onlineUsers.some(user => user.userId === userId) &&
            onlineUsers.push({ userId, socketId: socket.id });
    });
    console.log("online users ", onlineUsers);
    io.emit('onlineUsers', onlineUsers);
    socket.on('message', (msg) => {
        const user = onlineUsers.find((user) => user.userId === msg.receiverId);
        if (user) {
            io.to(user.socketId).emit('message', msg);
        }
    });
    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
        io.emit('onlineUsers', onlineUsers);
    });
});
io.listen(2178);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});