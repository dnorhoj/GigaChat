import type { Request, Response } from "express";
import { object, string } from "yup";
import { requireSchema } from "../../../lib/middleware";
import prisma from "../../../prisma";
import bcrypt from "bcrypt";
import { generateSessionToken } from "../../../lib/utils";

const registerSchema = object().shape({
    username: string().min(3).max(20).matches(/^[a-zA-Z0-9_]+$/).required(),
    password: string().min(8).max(100).required(),
    publicKey: string().required(),
    encryptedKey: string().required(),
    name: string().min(1).max(32).required(),
    email: string().email().required(),
});

export const post = [
    requireSchema(registerSchema),
    async (req: Request, res: Response) => {
        // Hash the password
        const data = res.locals.body;
        data.password = await bcrypt.hash(data.password, 10);

        let user;

        try {
            // Try to create user
            user = await prisma.user.create({ data });
        } catch (err) {
            // @ts-ignore
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
                token: generateSessionToken()
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
    }
];