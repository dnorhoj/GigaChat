import http from 'http';
import express from 'express';
import { WSServer } from './ws/ws';
import createRouter from 'express-file-routing'
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// Attach the WebSocket server to the HTTP server
new WSServer(server);

// Setup JSON body parsing
app.use(express.json());
app.use((req, res, next) => {
    if (req.method === 'POST' && !req.is('application/json')) {
        res.status(400)
            .header('Content-Type', 'text/plain')
            .send('Only application/json is supported');
        return;
    }

    next();
});

// CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
}));

// Load router:
//router(app);
createRouter(app);

const port = 8080;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});