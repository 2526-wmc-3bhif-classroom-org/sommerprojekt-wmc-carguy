import express from "express";
import { requireAuth } from "../auth-middleware";
import { ShoutService } from "./shout-service";
import { ShoutRepository } from "./shout-repository";
import { StatusCodes } from "http-status-codes";

const shoutRepository = new ShoutRepository();
const shoutService = new ShoutService(shoutRepository);

export const shoutRouter = express.Router();

shoutRouter.get("/shouts", (req, res) => {
    try {
        const result = shoutService.getRecentShouts();
        res.json(result);
    } catch (e: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
    }
});

shoutRouter.post("/shouts", requireAuth, (req: any, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.uid;

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(StatusCodes.BAD_REQUEST).send("Invalid shout content");
        }

        shoutService.postShout(content.trim(), userId);
        res.status(StatusCodes.CREATED).json({ message: "Shout posted successfully" });
    } catch (e: any) {
        res.status(StatusCodes.BAD_REQUEST).send(e.message);
    }
});

shoutRouter.delete("/shouts/:id", requireAuth, (req: any, res) => {
    try {
        const sid = Number(req.params.id);
        if (isNaN(sid)) {
            return res.status(StatusCodes.BAD_REQUEST).send("Invalid shout ID");
        }

        // Only allow admins to delete shouts for moderation (and also shout authors if we want, but admins are key)
        const isMod = req.user.role === "admin" || req.user.username === "admin";
        if (!isMod) {
            return res.status(StatusCodes.FORBIDDEN).send("Unauthorized action");
        }

        shoutService.removeShout(sid);
        res.json({ message: "Shout deleted successfully" });
    } catch (e: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
    }
});
