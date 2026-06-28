import express from "express";
import { requireAdmin } from "../auth-middleware";
import { ModerationRepository } from "./moderation-repository";

const moderationRepository = new ModerationRepository();
export const moderationRouter = express.Router();

moderationRouter.get("/admin/moderation/logs", requireAdmin, (req, res) => {
    try {
        const logs = moderationRepository.getLogs();
        res.json(logs);
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

moderationRouter.get("/admin/moderation/stats", requireAdmin, (req, res) => {
    try {
        const stats = moderationRepository.getStats();
        res.json(stats);
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});

moderationRouter.post("/admin/moderation/clear", requireAdmin, (req, res) => {
    try {
        moderationRepository.clearLogs();
        res.json({ message: "Logs cleared successfully" });
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});
