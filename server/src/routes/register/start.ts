import type { Request, Response } from "express";
import { requireSchema } from "../../lib/middleware";
import prisma from "../../prisma";
import { object, string } from "yup";

const checkSchema = object().shape({
    username: string().min(3).max(20).required(),
    email: string().email().required(),
});

export const post = [
    requireSchema(checkSchema),
    async (req: Request, res: Response) => {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: req.body.username },
                    { email: req.body.email }
                ]
            }
        });
        
        if (user) {
            res.status(400).send({
                status: false,
                message: "Username or email already exists"
            });
            return;
        }

        res.status(200).send({
            status: true,
            message: "Username and email are available"
        });
    }
]