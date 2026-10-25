import type { NextFunction, Request, Response } from "express";
import { addCampaignProductSchema, createCampaignSchema } from "./campaigns.schema.js";
import {
  addProductToCampaign,
  createCampaign,
  getActiveCampaigns,
  getCampaignBySlug,
} from "./campaigns.service.js";

export async function listActiveCampaigns(_req: Request, res: Response, next: NextFunction) {
  try {
    const campaigns = await getActiveCampaigns();
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

export async function getCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string;
    if (!slug) {
      res.status(400).json({ error: "Campaign slug is required" });
      return;
    }
    const campaign = await getCampaignBySlug(slug);
    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }
    res.json(campaign);
  } catch (err) {
    next(err);
  }
}

export async function createNewCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createCampaignSchema.parse(req.body);
    const campaign = await createCampaign(parsed);
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
}

export async function addProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: "Campaign ID is required" });
      return;
    }
    const parsed = addCampaignProductSchema.parse(req.body);
    const item = await addProductToCampaign(id, parsed);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}
