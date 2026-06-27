import express from "express";
import { StatusCodes } from "http-status-codes";
import { GuideService } from "./guide-service";
import { GuideRepository } from "./guide-repository";
import { requireAuth } from "../auth-middleware";
import { UserRepository } from "../user/user-repository";

const guideService = new GuideService(new GuideRepository(), new UserRepository());
export const guideRouter = express.Router();

guideRouter.get("/guides", (req, res) => {
    try {
        const result = guideService.getAllGuides();
        res.json(result);
    } catch (error) {
        console.error("Failed to fetch guides:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch guides" });
    }
});

guideRouter.get("/guides/:id", (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(StatusCodes.BAD_REQUEST).send("Invalid id");

    try {
        const result = guideService.getGuideById(id);
        if (!result) return res.status(StatusCodes.NOT_FOUND).send("Guide not found");
        res.json(result);
    } catch (error) {
        console.error("Failed to fetch guide:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch guide" });
    }
});

guideRouter.post("/guide", requireAuth, (req, res) => {
    const userClaims = req.user;
    if (!userClaims) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const { title, description, content } = req.body;
    if (!title || !description || !Array.isArray(content) || content.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid guide data. Title, description, and steps are required." });
    }

    try {
        guideService.createGuide(title, description, content, userClaims.username);
        res.status(StatusCodes.CREATED).json({ message: "Guide created successfully" });
    } catch (error) {
        console.error("Failed to create guide:", error);
        if (error instanceof Error) {
            res.status(StatusCodes.FORBIDDEN).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred" });
        }
    }
});

guideRouter.put("/guide/:id", requireAuth, (req, res) => {
    const userClaims = req.user;
    if (!userClaims) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });

    const { title, description, content } = req.body;
    if (!title || !description || !Array.isArray(content) || content.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid guide data." });
    }

    try {
        guideService.updateGuide(id, title, description, content, userClaims.username);
        res.status(StatusCodes.OK).json({ message: "Guide updated successfully" });
    } catch (error) {
        if (error instanceof Error) {
            const status = error.message.includes("only edit") ? StatusCodes.FORBIDDEN : StatusCodes.NOT_FOUND;
            res.status(status).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred" });
        }
    }
});

guideRouter.delete("/guide/:id", requireAuth, (req, res) => {
    const userClaims = req.user;
    if (!userClaims) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid id" });

    try {
        guideService.deleteGuide(id, userClaims.username);
        res.status(StatusCodes.OK).json({ message: "Guide deleted successfully" });
    } catch (error) {
        if (error instanceof Error) {
            const status = error.message.includes("only delete") ? StatusCodes.FORBIDDEN : StatusCodes.NOT_FOUND;
            res.status(status).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "An unexpected error occurred" });
        }
    }
});
