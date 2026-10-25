import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  dashboard,
  listAdminOrders,
  listAdminProducts,
  listStores,
  updateOrderStatus,
  updateStoreMart,
  updateStoreVerification,
} from "./admin.controller.js";

export const adminRouter: RouterType = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/dashboard", dashboard);
adminRouter.get("/products", listAdminProducts);
adminRouter.get("/orders", listAdminOrders);
adminRouter.patch("/orders/:orderId/status", updateOrderStatus);

// Store verification & Mart status
adminRouter.get("/stores", listStores);
adminRouter.patch("/stores/:storeId/mart", updateStoreMart);
adminRouter.patch("/stores/:storeId/verification", updateStoreVerification);
