require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database/database.js')
const chatRoute = require('./routes/chatRoute.js')
const userRoute = require('./routes/userRoute.js')
const messageRoute = require('./routes/messageRoute.js')

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/user", userRoute);
app.use("/chats", chatRoute);
app.use("/messages", messageRoute);

const start = async () => {
    try {
        connectDB();
        app.listen(port, console.log('server is connceted'))
    } catch (error) {
        console.log(error)
    }
}
start();