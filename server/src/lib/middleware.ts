import { ValidationError } from "yup";
import type { ObjectSchema } from "yup";
import type { RequestHandler } from "express";

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
