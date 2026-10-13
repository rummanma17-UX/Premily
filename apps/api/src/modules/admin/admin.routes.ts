import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  dashboard,
  listAdminOrders,
  listAdminProducts,
  updateOrderStatus,
} from "./admin.controller.js";

export const adminRouter: RouterType = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/dashboard", dashboard);
adminRouter.get("/products", listAdminProducts);

adminRouter.get("/orders", listAdminOrders);
adminRouter.patch("/orders/:orderId/status", updateOrderStatus);
