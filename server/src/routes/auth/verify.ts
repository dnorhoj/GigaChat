import type { Request, Response } from "express"
import { object, string } from "yup"
import { requireSchema } from "../../lib/middleware"
import prisma from "../../prisma";

const verifySchema = object().shape({
    token: string().required()
});

export const post = [
    requireSchema(verifySchema),
    async (req: Request, res: Response) => {
        const session = await prisma.session.findUnique({
            where: {
                token: res.locals.body.token
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        encryptedKey: true,
                        publicKey: true,
                    },
                },
            },
        });

        if (!session || session.expires < new Date()) {
            return res.status(400).json({
                status: false,
                message: "Invalid session",
            });
        }

        return res.status(200).json({
            status: true,
            data: {
                user: session.user,
            },
        });
    }
]