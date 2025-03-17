require('dotenv').config();
const express = require('express');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
const wss = new WebSocketServer({ port: process.env.WEBSOCKET_PORT });

wss.on('listening', () => {
    console.log(`Web Socket is listening on port:${process.env.WEBSOCKET_PORT}`);
});

wss.on('connection', (ws) => {
    ws.on('error', (error) => {
        console.error(`Error: ${error}`);
    });

    ws.on('message', function(data) {
        let JSONData = JSON.parse(data);

        // Handle user connection
        if (JSONData.name) {
            console.log(`${JSONData.name} has connected!`);
            ws.name = JSONData.name;
            // Broadcast list of connected users (excluding self)
            const users = Array.from(wss.clients)
                .filter(client => client.readyState === WebSocket.OPEN)
                .map(client => client.name);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'users', users: users }));
                }
            });
            ws.send(JSON.stringify({ announcement: `${ws.name} has joined chat!` }));
        } 
        // Handle private message
        else if (JSONData.to && JSONData.message) {
            const sender = ws.name;
            const recipient = JSONData.to;

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    // Send to recipient
                    if (client.name === recipient) {
                        client.send(JSON.stringify({ 
                            type: 'private', 
                            from: sender, 
                            message: JSONData.message 
                        }));
                    }
                    // Send copy to sender (for confirmation)
                    if (client.name === sender) {
                        client.send(JSON.stringify({ 
                            type: 'private', 
                            from: sender, 
                            to: recipient,
                            message: JSONData.message 
                        }));
                    }
                }
            });
        }
    });

    ws.on('close', () => {
        if (ws.name) {
            const users = Array.from(wss.clients)
                .filter(client => client.readyState === WebSocket.OPEN)
                .map(client => client.name);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ 
                        type: 'users', 
                        users: users 
                    }));
                    client.send(JSON.stringify({ 
                        announcement: `${ws.name} has left chat!` 
                    }));
                }
            });
        }
    });
});

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});