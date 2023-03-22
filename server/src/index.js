import http from 'http';
import express from 'express';
import { WSServer } from './ws.js';
import * as yup from 'yup';
import prisma from './prisma.js';
import bcrypt from 'bcrypt';
import { requireSchema } from './lib/middleware.js';
import { generateToken } from './lib/utils.js';

const app = express();
const server = http.createServer(app);

const clientUrl = 'http://localhost:5173'

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Origin', clientUrl);
    next();
});

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

const registerSchema = yup.object().shape({
    username: yup.string().min(3).max(20).required(),
    password: yup.string().min(8).max(100).required(),
    publicKey: yup.string().required(),
    encryptedKey: yup.string().required(),
    name: yup.string().min(1).max(32).required(),
    email: yup.string().email().required(),
});

app.post('/register', requireSchema(registerSchema), async (req, res) => {
    // Hash the password
    const data = res.locals.body;
    data.password = await bcrypt.hash(data.password, 10);

    let user;

    try {
        // Try to create user
        user = await prisma.user.create({ data });
    } catch (err) {
        if (err.code === 'P2002') {
            res.status(400).send({
                status: false,
                message: "Username or email is already taken"
            });
            return;
        }

        console.error(err);
        res.status(500).send({
            status: false,
            message: "An unknown error occurred"
        });
        return;
    }

    // Create a session for the user
    const session = await prisma.session.create({
        data: {
            user: {
                connect: {
                    id: user.id
                }
            },
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            token: generateToken()
        }
    });

    // Success!
    res.send({
        status: true,
        message: "Successfully registered",
        data: {
            token: session.token
        }
    });
});

const loginSchema = yup.object().shape({
    username: yup.string().min(3).max(20).required(),
    email: yup.string().email().required(),
});

app.post('/login', requireSchema(loginSchema), async (req, res) => {
    const data = res.locals.body;

    // Find the user
    const user = await prisma.user.findUnique({
        where: {
            username: data.username
        }
    });

    // Check if the user exists
    if (!user) {
        res.status(400).send({
            status: false,
            message: "Invalid username or password"
        });
        return;
    }

    // Check if the password is correct
    const valid = await bcrypt.compare(data.password, user.password);

    if (!valid) {
        res.status(400).send({
            status: false,
            message: "Invalid username or password"
        });
        return;
    }

    // Create a session for the user
    const session = await prisma.session.create({
        data: {
            user: {
                connect: {
                    id: user.id
                }
            },
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            token: generateToken()
        }
    });

    // Success!
    res.send({
        status: true,
        message: "Successfully logged in",
        token: session.token
    });
});

server.listen(8080, () => {
    console.log('Listening on %d', server.address().port);
});