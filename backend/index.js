require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');

const connectDB = require('./database/database.js');
const chatRoute = require('./routes/chatRoute.js');
const userRoute = require('./routes/userRoute.js');
const messageRoute = require('./routes/messageRoute.js');
const uploadRoute = require('./routes/uploadRoute.js');
const groupRoute = require('./routes/groupRoute.js');
const initializeSocket = require('./socket/socketConfig.js');
const setupSocketHandlers = require('./socket/socketHandlers.js');

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Initialize socket.io
const io = initializeSocket(server);
setupSocketHandlers(io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/user", userRoute);
app.use("/chats", chatRoute);
app.use("/messages", messageRoute);
app.use("/upload", uploadRoute);
app.use('/group', groupRoute);

const start = async () => {
    try {
        await connectDB();
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();