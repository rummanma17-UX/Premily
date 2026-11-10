import { Router, type Router as RouterType } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { addProduct, createNewCampaign, getCampaign, listActiveCampaigns, updateCampaignStatus } from "./campaigns.controller.js";

export const campaignsRouter: RouterType = Router();
campaignsRouter.get("/", listActiveCampaigns);
campaignsRouter.get("/:slug", getCampaign);
campaignsRouter.post("/", requireAuth, requireRole("ADMIN"), createNewCampaign);
campaignsRouter.post("/:id/products", requireAuth, requireRole("ADMIN"), addProduct);
campaignsRouter.patch("/:id/status", requireAuth, requireRole("ADMIN"), updateCampaignStatus);
