import express from "express";
import { requireAuth } from "../auth-middleware";
import { ShoutService } from "./shout-service";
import { ShoutRepository } from "./shout-repository";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../user/user-repository";
import { ModerationService } from "../moderation/moderation-service";
import { ModerationRepository } from "../moderation/moderation-repository";

const shoutRepository = new ShoutRepository();
const shoutService = new ShoutService(shoutRepository);
const userRepository = new UserRepository();
const moderationService = new ModerationService();
const moderationRepository = new ModerationRepository();

export const shoutRouter = express.Router();

shoutRouter.get("/shouts", (req, res) => {
    try {
        const result = shoutService.getRecentShouts();
        res.json(result);
    } catch (e: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
    }
});

shoutRouter.post("/shouts", requireAuth, async (req: any, res) => {
    try {
        const { content } = req.body;

        if (!content || typeof content !== "string" || !content.trim()) {
            return res.status(StatusCodes.BAD_REQUEST).send("Invalid shout content");
        }

        // Resolve uid from username stored in JWT (uid is not in the token payload)
        const user = userRepository.findUserByUsername(req.user.username);
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).send("User not found");
        }

        // AI / local moderation check
        const moderation = await moderationService.moderateContent(content.trim());
        if (!moderation.safe) {
            moderationRepository.logModeration("shout", content.trim(), "blocked", moderation.reason || "Blocked by moderation");
            return res.status(StatusCodes.BAD_REQUEST).send("Message blocked by content moderation. Keep the community clean!");
        }
        moderationRepository.logModeration("shout", content.trim(), "passed", null);

        shoutService.postShout(content.trim(), user.uid);
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

        const isMod = req.user.role === "admin";
        if (!isMod) {
            return res.status(StatusCodes.FORBIDDEN).send("Unauthorized action");
        }

        shoutService.removeShout(sid);
        res.json({ message: "Shout deleted successfully" });
    } catch (e: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(e.message);
    }
});
