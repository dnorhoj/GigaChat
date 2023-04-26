import type { Request, Response } from "express"
import { requireAuth } from "../../lib/middleware"
import { requireSchema } from "../../lib/middleware"
import { bool, date, object, string } from "yup";
import prisma from "../../prisma";

// How many events to return per request
const event_amount = 20;

const getEventsSchema = object().shape({
    username: string().required(),
    initial: bool().default(false),
    lastEventDate: date().default(new Date(0)),
});

export const post = [
    requireSchema(getEventsSchema),
    requireAuth,
    async (req: Request, res: Response) => {
        const { username, initial, lastEventDate } = res.locals.body;

        let response: any = {};

        // Check if chat exists
        const chat = await prisma.chat.findFirst({
            where: {
                chatUsers: {
                    every: {
                        OR: [
                            {
                                userId: res.locals.user.id,
                            },
                            {
                                user: { username }
                            }
                        ]
                    }
                }
            }
        });

        if (!chat) {
            return res.status(400).json({
                status: false,
                message: "Chat not found",
            });
        }

        if (initial) {
            // Send encrypted AES key if chat is loaded for the first time
            const chatUser = await prisma.chatUser.findFirst({
                where: {
                    chatId: chat.id,
                    userId: res.locals.user.id,
                }
            });

            if (!chatUser) {
                return res.status(400).json({
                    status: false,
                    message: "Chat not found",
                });
            }

            response.encryptedKey = chatUser.recipientKey;
        }

        // Get events
        const events = await prisma.event.findMany({
            where: {
                chatId: chat.id,
                createdAt: (initial ? undefined : {
                    lt: lastEventDate,
                })
            },
            orderBy: {
                createdAt: "desc",
            },
            take: event_amount,
        });

        // Events in descending order
        response.events = events;

        // Send response
        res.json({
            status: true,
            data: response,
        });
    }
]