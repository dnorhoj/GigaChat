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
            },
            include: {
                chatUsers: initial ? true : false,
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
            const selfUser = chat.chatUsers.find((chatUser) => chatUser.userId === res.locals.user.id);
            const otherUser = await prisma.user.findUnique({
                where: {
                    username,
                },
                select: {
                    id: true,
                    username: true,
                    name: true
                },
            });

            response.initial = {
                id: chat.id,
                encryptedKey: selfUser?.recipientKey,
                user: otherUser,
            }
        }

        // Get events
        const events = await prisma.event.findMany({
            where: {
                chatId: chat.id,
                timestamp: (initial ? undefined : {
                    lt: lastEventDate,
                })
            },
            orderBy: {
                timestamp: "desc",
            },
            take: event_amount,
        });

        // Events in descending order
        response.events = events.reverse().map((event) => ({
            id: event.id,
            timestamp: event.timestamp,
            chat: event.chatId,
            from: event.userId,
            content: event.content
        }));

        // Send response
        res.json({
            status: true,
            data: response,
        });
    }
]