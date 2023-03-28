import { WebSocketServer } from 'ws';
import prisma from './prisma.js';
import wsEvents from './lib/ws-events.js';

const parseMessage = (message) => {
    try {
        const msg = JSON.parse(message);

        const { type, data } = msg;

        return { type, data };
    } catch (err) {
        return null;
    }
}

const auth = async (token) => {
    const session = await prisma.session.findUnique({
        where: {
            token
        },
        select: {
            expires: true,
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true
                }
            }
        }
    });

    if (!session || session.expires < new Date()) {
        return false;
    }

    return session.user;
}

// WebSocket connection class that stores connection data
class WSConnection {
    constructor(ws, user) {
        this.ws = ws;
        this.user = user;
    }

    send(type, data) {
        this.ws.send(JSON.stringify({ type, data }));
    }

    error(message) {
        this.send('error', { message });
    }
}

// WebSocket server class that handles all the connections
export class WSServer {
    clients = new Set();

    constructor(server) {
        this.wss = new WebSocketServer({ noServer: true });
        this.httpServer = server;

        this.setup();
    }

    setup() {
        // Hook into the HTTP server
        // Here we can add an authentication check before upgrading the connection
        this.httpServer.on('upgrade', async (req, socket, head) => {
            const token = req.url.split('?token=')[1];

            if (!token) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            const user = await auth(token);

            if (!user) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            req.user = user;

            this.wss.handleUpgrade(req, socket, head, (ws) => {
                this.wss.emit('connection', ws, req);
            });
        });

        // Setup websocket on connection event
        this.wss.on('connection', async (ws, req) => {
            // Create a new connection
            const conn = new WSConnection(ws, req.user);
            this.clients.add(conn);

            ws.on('message', async (message) => {
                const data = parseMessage(message);

                if (!data) {
                    conn.error("Invalid message");
                    return;
                }

                if (!Object.keys(wsEvents).includes(data.type)) {
                    conn.error("Invalid message");
                    return;
                }

                const schema = wsEvents[data.type];

                let eventData;

                if (schema !== null) {
                    try {
                        eventData = await schema.validate(data.data);
                    } catch (err) {
                        conn.error("Invalid message");
                        return;
                    }
                }

                this.handleEvent(conn, data.type, eventData);
            });

            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
    }

    async handleEvent(conn, type, data) {
        switch (type) {
            case 'ping':
                conn.send('pong', null);
                break;
            case 'me':
                conn.send('me', {
                    username: conn.user.username,
                    name: conn.user.name,
                    email: conn.user.email
                });
                break;
            default:
                conn.error("Invalid message");
                break;
        }
    }
}
