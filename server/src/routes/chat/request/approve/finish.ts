import { object, string } from "yup";
import { requireAuth, requireSchema } from "../../../../lib/middleware";
import { Request, Response } from "express";
import prisma from "../../../../prisma";
import { wsServer } from "../../../../server";

const finishRequestApproval = object().shape({
    requestId: string().required(),
    encryptedRecipientKey: string().required(),
    encryptedSenderKey: string().required(),
});

export const post = [
    requireSchema(finishRequestApproval),
    requireAuth,
    async (req: Request, res: Response) => {
        const { requestId, encryptedRecipientKey, encryptedSenderKey } = res.locals.body;

        const request = await prisma.chatRequest.findFirst({
            where: {
                id: requestId,
                recipientId: res.locals.user.id,
                status: "PENDING",
            }
        });

        if (!request) {
            return res.status(400).json({
                status: false,
                message: "Request not found",
            });
        }

        // Check if chat already exists
        const chatExists = await prisma.chat.findFirst({
            where: {
                chatUsers: {
                    every: {
                        OR: [
                            {
                                userId: request.senderId,
                            },
                            {
                                userId: request.recipientId,
                            }
                        ]
                    }
                }
            }
        });

        if (chatExists) {
            return res.status(400).json({
                status: false,
                message: "Chat already exists",
            });
        }

        // Create a new chat
        const chat = await prisma.chat.create({
            data: {
                chatUsers: {
                    createMany: {
                        data: [
                            {
                                userId: request.senderId,
                                recipientKey: encryptedSenderKey,
                            },
                            {
                                userId: request.recipientId,
                                recipientKey: encryptedRecipientKey,
                            }
                        ]
                    }
                }
            },
        });

        // Update the request
        await prisma.chatRequest.update({
            where: {
                id: requestId,
            },
            data: {
                status: "APPROVED",
            }
        });

        // Send update in ws
        wsServer.sendToUser(request.senderId, "overview-reload");

        return res.status(200).json({
            status: true,
            message: "Request approved",
        });
    }
]