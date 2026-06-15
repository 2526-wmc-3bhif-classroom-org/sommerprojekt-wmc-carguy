import express from "express";
import { ForumRepository } from "./forum-repository";
import { ForumService } from "./forum-service";
import { Forum } from "../../data/model";
import { UserRepository } from "../user/user-repository";
import { requireAuth } from "../auth-middleware";

const userRepository = new UserRepository();
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

forumRouter.get("/forums/brands", (req, res) => {
    const result = forumService.getBrandsWithModels();
    res.json(result);
});

forumRouter.get("/forums/joined", requireAuth, (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username) as any;
    if (!user) return res.status(404).send("User not found");

    const result = forumService.getJoinedForums(user.uid);
    res.json(result);
});

forumRouter.get("/categories", (req, res) => {
    const result = forumService.getAllCategories();
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

forumRouter.post("/forum", requireAuth, (req, res) => {
    if (!req.user) return res.status(401).send("Unauthorized");
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(404).send("User not found");

    const name: string = req.body.name;
    const description: string | undefined = req.body.description;
    const parentForumId: number | undefined = req.body.parentForumId;
    const categoryId: number | undefined = req.body.categoryId;
    const createdAt: Date = new Date();

    if (!name || name.trim() === '') {
        return res.status(400).send("Name is required");
    }

    // Sub-forum creation requires 100+ Aura or admin role
    if (parentForumId) {
        const isVerified = (user.totalAura ?? 0) >= 100 || user.role === "admin";
        if (!isVerified) {
            return res.status(403).send("Only verified users with 100+ Aura or admins can create model sub-forums.");
        }
    }

    const forum: Forum = {
        forumId: 0,
        name: name,
        description: description,
        createdAt: createdAt
    };

    try {
        const newId = forumService.createForum(forum, user.uid, parentForumId, categoryId);
        res.status(201).json({ message: "Forum created", forumId: newId });
    } catch (e: any) {
        console.error("Error creating forum:", e);
        res.status(500).send("Failed to create forum. Author might be invalid.");
    }
});

forumRouter.put("/forum/:id", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    const name: string = req.body.name;
    const description: string | undefined = req.body.description;

    if (isNaN(id)) return res.status(400).send("Invalid id");
    if (!name || name.trim() === '') return res.status(400).send("Name is required");
    if (!req.user) return res.status(401).send("Unauthorized");

    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(404).send("User not found");

    const forum = forumService.getForumById(id);
    if (!forum) return res.status(404).send("Forum not found");

    const isOwner = forum.authorId === user.uid;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).send("You do not have permission to modify this forum.");
    }

    const updated = forumService.updateForum(id, name, description);
    if (!updated) {
        return res.status(404).send("Forum not found");
    }
    
    res.json({ message: "Forum updated successfully" });
});

forumRouter.delete("/forum/:id", requireAuth, (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).send("Invalid id");
    if (!req.user) return res.status(401).send("Unauthorized");

    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(404).send("User not found");

    const forum = forumService.getForumById(id);
    if (!forum) return res.status(404).send("Forum not found");

    const isOwner = forum.authorId === user.uid;
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).send("You do not have permission to delete this forum.");
    }

    const deleted = forumService.deleteForum(id);
    if (!deleted) {
        return res.status(404).send("Forum not found");
    }

    res.status(204).send();
});

forumRouter.post("/forum/:id/join", requireAuth, (req, res) => {
    const forumId = Number(req.params.id);
    if (isNaN(forumId)) return res.status(400).send("Invalid input");
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(404).send("User not found");
    
    const joined = forumService.joinForum(user.uid, forumId);
    if (joined) res.status(200).send({ message: "Joined successfully" });
    else res.status(400).send("Could not join forum");
});

forumRouter.post("/forum/:id/leave", requireAuth, (req, res) => {
    const forumId = Number(req.params.id);
    if (isNaN(forumId)) return res.status(400).send("Invalid input");
    if (!req.user) return res.status(401).send("Unauthorized");
    
    const user = userRepository.findUserByUsername(req.user.username);
    if (!user) return res.status(404).send("User not found");
    
    const left = forumService.leaveForum(user.uid, forumId);
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
