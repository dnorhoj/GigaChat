import type http from 'http';
import type { User } from '@prisma/client';
import type { WebSocket, RawData } from 'ws';
import { WebSocketServer } from 'ws';
import prisma from '../prisma';
import wsEvents from '../lib/ws-events';
import { object, string } from 'yup';

const messageSchema = object().shape({
    type: string().oneOf(Object.keys(wsEvents)).required(),
    data: object().required()
});

const parseMessage = async (message: RawData) => {
    try {
        const msg = JSON.parse(message.toString());

        return await messageSchema.validate(msg);
    } catch (err) {
        return null;
    }
}

const auth = async (token: string) => {
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
    ws: WebSocket;
    user: User;

    constructor(ws: WebSocket, user: User) {
        this.ws = ws;
        this.user = user;
    }

    send(type: string, data?: object) {
        this.ws.send(JSON.stringify({ type, data }));
    }

    error(message: string) {
        this.send('error', { message });
    }
}

// WebSocket server class that handles all the connections
export class WSServer {
    wss: WebSocketServer;
    httpServer: http.Server;
    clients: Set<WSConnection>


    constructor(server: http.Server) {
        this.wss = new WebSocketServer({ noServer: true });
        this.httpServer = server;
        this.clients = new Set();

        this.setup();
    }

    setup() {
        // Hook into the HTTP server
        // Here we can add an authentication check before upgrading the connection
        this.httpServer.on('upgrade', async (req, socket, head) => {
            const token = req.url?.split('?token=')[1];

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

            // @ts-ignore
            req.user = user;

            this.wss.handleUpgrade(req, socket, head, (ws) => {
                this.wss.emit('connection', ws, req);
            });
        });

        // Setup websocket on connection event
        this.wss.on('connection', async (ws, req) => {
            // Create a new connection
            // @ts-ignore
            const conn = new WSConnection(ws, req.user);
            this.clients.add(conn);

            ws.on('message', async (message) => {
                const data = await parseMessage(message);

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

                this.delegateEvent(conn, data.type, eventData);
            });

            ws.on('close', () => {
                this.clients.delete(conn);
            });
        });
    }

    async delegateEvent(conn: WSConnection, type: string, data?: object) {
        switch (type) {
            case 'ping':
                conn.send('pong');
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
