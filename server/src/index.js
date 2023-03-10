import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log('received: %s', message);
    });

    ws.on('close', () => {
        console.log('disconnected');
    });

    ws.send('something');
});

server.listen(process.env.PORT || 8080, () => {
    console.log('Listening on %d', server.address().port);
});