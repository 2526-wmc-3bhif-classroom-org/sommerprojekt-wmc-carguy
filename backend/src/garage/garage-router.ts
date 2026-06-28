import express from "express";
import { requireAuth } from "../auth-middleware";
import { GarageService } from "./garage-service";
import { GarageRepository } from "./garage-repository";
import { StatusCodes } from "http-status-codes";

import { ModerationService } from "../moderation/moderation-service";
import { ModerationRepository } from "../moderation/moderation-repository";

const garageRepository = new GarageRepository();
const garageService = new GarageService(garageRepository);
const moderationService = new ModerationService();
const moderationRepository = new ModerationRepository();

export const garageRouter = express.Router();

garageRouter.get("/users/:id/garage", (req, res) => {
    try {
        const uid = Number(req.params.id);
        if (isNaN(uid)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Invalid user ID");
        }
        const result = garageService.getUserVehicles(uid);
        res.json(result);
    } catch (e: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
    }
});

garageRouter.post("/users/garage", requireAuth, async (req: any, res) => {
    try {
        const { make, model, year, mods } = req.body;
        let { imageUrl } = req.body;
        const uid = req.user.uid;

        if (!make || !model || !year) {
            return res.status(StatusCodes.BAD_REQUEST).send("Make, model, and year are required");
        }

        const parsedYear = Number(year);
        if (isNaN(parsedYear)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Invalid year value");
        }

        const textContent = `${make} ${model} ${year} ${mods || ""}`;
        const moderation = await moderationService.moderateContent(textContent, imageUrl ? [imageUrl] : undefined);

        if (!moderation.safe) {
            moderationRepository.logModeration("garage", textContent, "blocked", moderation.reason || "Unsafe vehicle content");
            return res.status(StatusCodes.BAD_REQUEST).send("Content blocked by AI Safety: Inappropriate language or content detected.");
        }

        if (imageUrl && moderation.flaggedImages && moderation.flaggedImages.includes(imageUrl)) {
            imageUrl = `flagged:${imageUrl}`;
            moderationRepository.logModeration("garage", textContent, "flagged", "Flagged vehicle image");
        } else {
            moderationRepository.logModeration("garage", textContent, "passed", null);
        }

        garageService.addVehicle(uid, make.trim(), model.trim(), parsedYear, mods?.trim(), imageUrl?.trim());
        res.status(StatusCodes.CREATED).json({ message: "Vehicle added to garage" });
    } catch (e: any) {
        res.status(StatusCodes.BAD_REQUEST).send(e.message);
    }
});

garageRouter.delete("/users/garage/:id", requireAuth, (req: any, res) => {
    try {
        const gvid = Number(req.params.id);
        const uid = req.user.uid;

        if (isNaN(gvid)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Invalid vehicle ID");
        }

        garageService.removeVehicle(gvid, uid);
        res.json({ message: "Vehicle removed from garage" });
    } catch (e: any) {
        res.status(StatusCodes.BAD_REQUEST).send(e.message);
    }
});
