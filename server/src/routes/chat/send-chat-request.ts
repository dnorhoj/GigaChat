import type { Request, Response } from "express";
import { requireAuth, requireSchema } from "../../lib/middleware";
import { object, string } from "yup";
import prisma from "../../prisma";
import { wsServer } from "../../server";

const sendChatRequestSchema = object().shape({
    username: string().required()
});

export const post = [
    requireSchema(sendChatRequestSchema),
    requireAuth,
    async (req: Request, res: Response) => {
        const { username } = res.locals.body;

        if (username === res.locals.user.username) {
            return res.status(400).json({
                status: false,
                message: "You cannot send a chat request to yourself"
            });
        }

        const requestedUser = await prisma.user.findUnique({
            where: {
                username
            }
        });

        if (!requestedUser) {
            return res.status(400).json({
                status: false,
                message: "User not found"
            });
        }

        const existingChat = await prisma.chat.findFirst({
            where: {
                chatUsers: {
                    every: {
                        userId: {
                            in: [res.locals.user.id, requestedUser.id]
                        }
                    }
                }
            }
        });

        if (existingChat) {
            return res.status(400).json({
                status: false,
                message: "Chat already exists"
            });
        }

        const existingRequest = await prisma.chatRequest.findFirst({
            where: {
                OR: [
                    {
                        senderId: res.locals.user.id,
                        recipientId: requestedUser.id
                    },
                    {
                        senderId: requestedUser.id,
                        recipientId: res.locals.user.id
                    }
                ]
            }
        });

        if (existingRequest) {
            return res.status(400).json({
                status: false,
                message: "Chat request already exists"
            });
        }

        await prisma.chatRequest.create({
            data: {
                senderId: res.locals.user.id,
                recipientId: requestedUser.id
            }
        });

        wsServer.sendToUser(requestedUser.id, "overview-reload");

        res.json({
            status: true
        });
    }
]