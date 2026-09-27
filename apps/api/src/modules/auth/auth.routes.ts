import { Router, type Router as RouterType } from "express";
import { login, logout, me, register } from "./auth.controller.js";
import { requireAuth } from "../../middleware/auth.js";

export const authRouter: RouterType = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me",requireAuth, me);
