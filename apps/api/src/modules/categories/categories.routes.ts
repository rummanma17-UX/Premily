import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { addCategory, listCategories } from "./categories.controller.js";

export const categoriesRouter: RouterType = Router();

categoriesRouter.get("/", listCategories);
categoriesRouter.post("/", requireAuth, requireRole("ADMIN"), addCategory);
