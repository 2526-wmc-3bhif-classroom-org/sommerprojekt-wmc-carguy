import express from "express";
import { requireAdmin } from "../auth-middleware";
import { ModerationRepository } from "./moderation-repository";
import { aiConfig } from "../config";

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

moderationRouter.get("/admin/moderation/settings", requireAdmin, (req, res) => {
    res.json({
        provider: aiConfig.provider,
        model: aiConfig.model,
        apiUrl: aiConfig.apiUrl,
        hasApiKey: !!aiConfig.apiKey,
    });
});

moderationRouter.post("/admin/moderation/settings", requireAdmin, (req: any, res) => {
    try {
        const { provider, model, apiKey, apiUrl } = req.body;
        if (provider !== undefined) aiConfig.provider = String(provider).toLowerCase();
        if (model !== undefined) aiConfig.model = String(model);
        if (apiKey !== undefined) aiConfig.apiKey = String(apiKey);
        if (apiUrl !== undefined) aiConfig.apiUrl = String(apiUrl);
        res.json({
            message: "Settings updated",
            provider: aiConfig.provider,
            model: aiConfig.model,
            hasApiKey: !!aiConfig.apiKey,
        });
    } catch (e: any) {
        res.status(500).send(e.message);
    }
});
