import type { ObjectSchema } from "yup";
import type { RequestHandler } from "express";
import { ValidationError } from "yup";
import prisma from "../prisma";

/** Validates the request body against a schema and stores the result in res.locals.body */
export const requireSchema: (schema: ObjectSchema<any>) => RequestHandler = (schema) => async (req, res, next) => {
    try {
        res.locals.body = await schema.validate(req.body);
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).send({
                status: false,
                message: err.message
            });
            return;
        }

        return res.status(500);
    }

    next();
}

/** Checks if the user is authenticated and stores the user in res.locals.user */
export const requireAuth: RequestHandler = async (req, res, next) => {
    const token = req.get("X-Token");

    if (!token) {
        return res.status(401).send({
            status: false,
            message: "Not authenticated",
        });
    }

    const session = await prisma.session.findUnique({
        where: {
            token
        },
        include: {
            user: true
        }
    });

    if (!session || session.expires < new Date()) {
        return res.status(401).send({
            status: false,
            message: "Not authenticated",
        });
    }

    res.locals.user = session.user;

    next();
}