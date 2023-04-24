import type { Request, Response } from "express";
import { object, string } from "yup";
import { requireSchema } from "../lib/middleware";
import { generateToken } from "../lib/utils";
import prisma from "../prisma";
import bcrypt from "bcrypt";

const loginSchema = object().shape({
    email: string().email().required(),
    password: string().max(100).required(),
});

export const post = [
    requireSchema(loginSchema),
    async (req: Request, res: Response) => {
        const data = res.locals.body;

        // Find the user
        const user = await prisma.user.findUnique({
            where: {
                email: data.email
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
            data: {
                token: session.token,
                encryptedKey: user.encryptedKey
            }
        });
    }
]