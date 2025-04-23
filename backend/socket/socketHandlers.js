let onlineUsers = [];

const getReceiverSocket = (io, receiverId) => {
    const user = onlineUsers.find(user => user.userId === receiverId);
    if (user) {
        return io.sockets.sockets.get(user.socketId);
    }
    return null;
};

const handleConnection = (socket, io) => {
    console.log('=== New Connection ===');
    console.log('Socket ID:', socket.id);
    console.log('User ID:', socket.user.userId);
    console.log('Current online users before adding:', onlineUsers);

    // Add user to online users immediately after connection
    try {
        const authenticatedUserId = socket.user.userId;
        console.log('Adding new user with ID:', authenticatedUserId);

        // Remove any existing connections for this user
        onlineUsers = onlineUsers.filter(user => user.userId !== authenticatedUserId);
        
        // Add the new connection
        onlineUsers.push({ userId: authenticatedUserId, socketId: socket.id });
        
        console.log('=== Updated Online Users Array ===');
        console.log('Full online users array:', JSON.stringify(onlineUsers, null, 2));
        
        // Emit the updated list of online user IDs to ALL clients including sender
        const onlineUserIds = onlineUsers.map(user => user.userId);
        console.log('Emitting online user IDs:', onlineUserIds);
        io.emit('onlineUsers', onlineUserIds);
    } catch (error) {
        console.error('Error adding user to online users:', error);
    }
};

const handleAddNewUser = (socket, io) => {
    socket.on('addNewUser', () => {
        try {
            const authenticatedUserId = socket.user.userId;
            console.log('=== Re-adding User ===');
            console.log('User ID:', authenticatedUserId);
            console.log('Current online users before re-adding:', onlineUsers);

            // Remove any existing connections for this user
            onlineUsers = onlineUsers.filter(user => user.userId !== authenticatedUserId);
            
            // Add the new connection
            onlineUsers.push({ userId: authenticatedUserId, socketId: socket.id });
            
            console.log('=== Updated Online Users Array ===');
            console.log('Full online users array:', JSON.stringify(onlineUsers, null, 2));
            
            // Emit the updated list of online user IDs to ALL clients including sender
            const onlineUserIds = onlineUsers.map(user => user.userId);
            console.log('Emitting online user IDs:', onlineUserIds);
            io.emit('onlineUsers', onlineUserIds);
        } catch (error) {
            console.error('Error in addNewUser:', error);
        }
    });
};

const handleMessage = (socket) => {
    socket.on('message', (msg) => {
        try {
            console.log('Received message:', msg);
            const user = onlineUsers.find((user) => user.userId === msg.receiverId);
            if (user) {
                console.log('Found receiver:', user);
                socket.to(user.socketId).emit('message', {
                    ...msg,
                    type: 'in'
                });
            } else {
                console.log('Receiver not found in online users');
            }
        } catch (error) {
            console.error('Error in message handling:', error);
        }
    });
};

const handleMessageUpdate = (socket) => {
    socket.on('messageUpdate', ({ messageId, content, receiverId }) => {
        try {
            const user = onlineUsers.find((user) => user.userId === receiverId);
            if (user) {
                socket.to(user.socketId).emit('messageUpdate', {
                    messageId,
                    content
                });
            }
        } catch (error) {
            console.error('Error in message update handling:', error);
        }
    });
};

const handleMessageDelete = (io, socket) => {
    socket.on('messageDelete', ({ messageId, receiverId }) => {
        console.log('Message delete event received:', { messageId, receiverId });
        
        // Emit to the receiver
        const receiverSocket = getReceiverSocket(io, receiverId);
        if (receiverSocket) {
            receiverSocket.emit('messageDelete', { messageId });
        }
        
        // Also emit back to sender to ensure sync
        socket.emit('messageDelete', { messageId });
    });
};

const handleDisconnect = (socket, io) => {
    socket.on('disconnect', () => {
        try {
            console.log('=== User Disconnected ===');
            console.log('Socket ID:', socket.id);
            console.log('User ID:', socket.user.userId);
            console.log('Online users before disconnect:', onlineUsers);

            // Remove the disconnected user from online users
            onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
            console.log('Online users after disconnect:', onlineUsers);
            
            // Emit the updated list of online user IDs to ALL clients including sender
            const onlineUserIds = onlineUsers.map(user => user.userId);
            console.log('Emitting online user IDs after disconnect:', onlineUserIds);
            io.emit('onlineUsers', onlineUserIds);
        } catch (error) {
            console.error('Error in disconnect:', error);
        }
    });
};

const handleError = (socket) => {
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
};

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        handleConnection(socket, io);
        handleAddNewUser(socket, io);
        handleMessage(socket);
        handleMessageUpdate(socket);
        handleMessageDelete(io, socket);
        handleDisconnect(socket, io);
        handleError(socket);
    });
};

module.exports = setupSocketHandlers; 