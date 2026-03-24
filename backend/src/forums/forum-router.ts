import express from "express";
import { ForumRepository } from "./forum-repository";
import { ForumService } from "./forum-service";
import {Forum, User} from "../../data/model";
import {userRouter} from "../user/user-router";

const forumService = new ForumService(new ForumRepository());
export const forumRouter = express.Router();

forumRouter.get("/forum", (req, res) => {
    const result = forumService.getAllForums();
    res.json(result);
});

forumRouter.get("/forum/:id", (req, res) => {
    const id = Number(req.params.id);

    if (typeof id !== "number") {
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

    if (typeof categoryId !== "number") {
        return res.status(400).send("Invalid categoryId");
    }

    const result = forumService.getForumByCategory(categoryId);
    res.json(result);
});

forumRouter.post("/forum", (req, res) => {
    const forum: Forum = req.body;

    forumService.createForum(forum);

    res.status(201).json({ message: "User created" });
});