import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  calculateShipping,
  getDistricts,
  updateMyStoreShipping,
} from "./shipping.controller.js";

export const shippingRouter: RouterType = Router();

shippingRouter.get("/districts", getDistricts);
shippingRouter.post("/calculate", calculateShipping);
shippingRouter.put("/store", requireAuth, requireRole("SELLER"), updateMyStoreShipping);
