import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { dashboard, listAdminProducts } from "./admin.controller.js";

export const adminRouter: RouterType = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/dashboard", dashboard);
adminRouter.get("/products", listAdminProducts);
