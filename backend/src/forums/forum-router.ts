import express from "express";
import { ForumRepository } from "./forum-repository";
import { ForumService } from "./forum-service";
import {Forum} from "../../data/model";

const forumService = new ForumService(new ForumRepository());
export const forumRouter = express.Router();

forumRouter.get("/forums", (req, res) => {
    const result = forumService.getAllForums();
    res.json(result);
});

forumRouter.get("/forums/trending", (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    if (isNaN(limit)) return res.status(400).send("Invalid limit");

    const result = forumService.getTrendingForums(limit);
    res.json(result);
});

forumRouter.get("/forum/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send("Invalid id");
    }

    const result = forumService.getForumById(id);

    if (!result) {
        return res.status(404).send("Forum not found");
    }

    res.json(result);
});

forumRouter.get("/forum/category/:categoryId", (req, res) => {
    const categoryId = Number(req.params.categoryId);

    if (isNaN(categoryId)) {
        return res.status(400).send("Invalid categoryId");
    }

    const result = forumService.getForumByCategory(categoryId);
    res.json(result);
});

forumRouter.post("/forum", (req, res) => {
    const name: string = req.body.name;
    const description: string | undefined = req.body.description;
    const author = req.body.author;
    const createdAt: Date = new Date();

    if (!name || name.trim() === '') {
        return res.status(400).send("Name is required");
    }

    const forum: Forum = {
        forumId: 0,
        name: name,
        description: description,
        createdAt: createdAt
    };

    try {
        const newId = forumService.createForum(forum, author?.uid);
        res.status(201).json({ message: "Forum created", forumId: newId });
    } catch (e: any) {
        console.error("Error creating forum:", e);
        res.status(500).send("Failed to create forum. Author might be invalid.");
    }
});

forumRouter.put("/forum/:id", (req, res) => {
    const id = Number(req.params.id);
    const name: string = req.body.name;
    const description: string | undefined = req.body.description;

    if (isNaN(id)) return res.status(400).send("Invalid id");
    if (!name || name.trim() === '') return res.status(400).send("Name is required");

    const updated = forumService.updateForum(id, name, description);
    if (!updated) {
        return res.status(404).send("Forum not found");
    }
    
    res.json({ message: "Forum updated successfully" });
});

forumRouter.delete("/forum/:id", (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) return res.status(400).send("Invalid id");

    const deleted = forumService.deleteForum(id);
    if (!deleted) {
        return res.status(404).send("Forum not found");
    }

    res.status(204).send();
});

forumRouter.post("/forum/:id/join", (req, res) => {
    const forumId = Number(req.params.id);
    const userId = req.body.userId;
    if (isNaN(forumId) || !userId) return res.status(400).send("Invalid input");
    
    const joined = forumService.joinForum(userId, forumId);
    if (joined) res.status(200).send({ message: "Joined successfully" });
    else res.status(400).send("Could not join forum");
});

forumRouter.post("/forum/:id/leave", (req, res) => {
    const forumId = Number(req.params.id);
    const userId = req.body.userId;
    if (isNaN(forumId) || !userId) return res.status(400).send("Invalid input");
    
    const left = forumService.leaveForum(userId, forumId);
    if (left) res.status(200).send({ message: "Left successfully" });
    else res.status(400).send("Could not leave forum");
});

forumRouter.get("/forum/:id/member/:userId", (req, res) => {
    const forumId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (isNaN(forumId) || isNaN(userId)) return res.status(400).send("Invalid input");
    
    const isMember = forumService.isUserInForum(userId, forumId);
    res.json({ isMember });
});
