import { Application } from "express";

export const router = (app: Application) => {
    // Authentication routes
    app.post("/register", require("./routes/auth/register").post)
    app.post("/login", require("./routes/auth/login").post)
}