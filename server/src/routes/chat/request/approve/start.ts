import type { Request, Response } from "express";
import { object, string } from "yup";
import { requireAuth, requireSchema } from "../../../../lib/middleware";
import prisma from "../../../../prisma";

const startRequestApproval = object().shape({
    requestId: string().required()
});

export const post = [
    requireAuth,
    requireSchema(startRequestApproval),
    async (req: Request, res: Response) => {
        const { requestId } = res.locals.body;

        const request = await prisma.chatRequest.findFirst({
            where: {
                id: requestId,
                recipientId: res.locals.user.id,
                status: "PENDING"
            },
            include: {
                recipient: true
            }
        });

        if (!request) {
            return res.status(400).json({
                status: false,
                message: "Request not found"
            });
        }

        res.json({
            status: true,
            data: {
                publicKey: request.recipient.publicKey
            }
        });
    }
]