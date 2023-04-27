import type { User } from "@prisma/client";
import type { Request, Response } from "express";
import { requireAuth } from "../../lib/middleware";
import prisma from "../../prisma";

export const get = [
    requireAuth,
    async (req: Request, res: Response) => {
        const user = res.locals.user as User;

        // Get all chats for the user
        const chatsNoUnread = await prisma.chat.findMany({
            where: {
                chatUsers: {
                    some: {
                        userId: user.id
                    }
                }
            },
            include: {
                chatUsers: {
                    where: {
                        userId: {
                            not: user.id
                        }
                    },
                    select: {
                        user: {
                            select: {
                                username: true,
                                name: true
                            }
                        }
                    }
                },
                events: {
                    orderBy: {
                        timestamp: "desc"
                    },
                    take: 1,
                    select: { timestamp: true }
                }
            },
        });

        // Find unread events
        const unreadMessages = await prisma.event.groupBy({
            by: ["chatId"],
            where: {
                chatId: {
                    in: chatsNoUnread.map(chat => chat.id)
                },
                userId: {
                    not: user.id
                },
                read: false
            },
            _count: {
                _all: true
            }
        });

        const chats = chatsNoUnread.sort((a, b) => {
            const aDate = a.events[0]?.timestamp || a.createdAt;
            const bDate = b.events[0]?.timestamp || b.createdAt;
            return bDate.getTime() - aDate.getTime();
        }).map(chat => {
            const unread = unreadMessages.find(event => event.chatId === chat.id);
            return {
                ...chat,
                unread: unread?._count._all || 0
            }
        });

        // Get all chat requests for the user
        const chatRequests = await prisma.chatRequest.findMany({
            where: {
                recipientId: user.id,
                status: "PENDING"
            },
            select: {
                id: true,
                createdAt: true,
                sender: {
                    select: {
                        id: true,
                        username: true,
                        name: true
                    }
                }
            }
        });

        return res.json({
            status: true,
            data: {
                chats,
                chatRequests
            }
        });
    }
]