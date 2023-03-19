export const requireSchema = (schema) => async (req, res, next) => {
    try {
        res.locals.body = await schema.validate(req.body);
    } catch (err) {
        res.status(400).send({
            status: false,
            message: err.message
        });
        return;
    }

    next();
}
