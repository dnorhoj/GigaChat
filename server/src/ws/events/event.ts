import prisma from "../../prisma"
import { WSConnection } from "../ws"

export const handle = async (conn: WSConnection, data: { chat: string, content: string }) => {
    const chat = await prisma.chat.findFirst({
        where: {
            id: data.chat,
            chatUsers: {
                some: {
                    userId: conn.user.id
                }
            }
        },
        select: {
            id: true,
            chatUsers: {
                select: {
                    userId: true
                }
            }
        }
    });

    if (!chat) {
        return conn.error("Chat not found");
    }

    let id: string;
    try {
        const event = await prisma.event.create({
            data: {
                chatId: chat.id,
                userId: conn.user.id,
                content: data.content,
            }
        });

        id = event.id;
    } catch (err) {
        return conn.error("Failed to send message");
    }

    // Broadcast message to all clients
    const userIds = chat.chatUsers.map((chatUser) => chatUser.userId);
    for (const client of conn.wss.clients) {
        if (userIds.includes(client.user.id)) {
            client.send("event", {
                id,
                timestamp: Date.now(),
                from: conn.user.id,
                chat: chat.id,
                content: data.content,
            });
        }
    }
}