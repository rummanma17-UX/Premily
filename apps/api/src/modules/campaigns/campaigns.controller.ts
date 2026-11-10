import { z } from "zod";
import type { NextFunction, Request, Response } from "express";
import { addCampaignProductSchema, createCampaignSchema } from "./campaigns.schema.js";
import { addProductToCampaign, createCampaign, getActiveCampaigns, getCampaignBySlug, setCampaignStatus } from "./campaigns.service.js";

export async function listActiveCampaigns(_req: Request, res: Response, next: NextFunction) {
  try { res.json(await getActiveCampaigns()); } catch (err) { next(err); }
}
export async function getCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const campaign = await getCampaignBySlug(req.params.slug as string);
    if (!campaign) { res.status(404).json({ error: "Campaign not found" }); return; }
    res.json(campaign);
  } catch (err) { next(err); }
}
export async function createNewCampaign(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json(await createCampaign(createCampaignSchema.parse(req.body))); }
  catch (err) { next(err); }
}
export async function addProduct(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await addProductToCampaign(req.params.id as string, addCampaignProductSchema.parse(req.body)));
  } catch (err) { next(err); }
}
export async function updateCampaignStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    res.json(await setCampaignStatus(req.params.id as string, isActive));
  } catch (err) { next(err); }
}
