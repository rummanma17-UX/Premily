import { Router, type Router as RouterType } from "express";
import { login, register } from "./auth.controller.js";

export const authRouter: RouterType = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
