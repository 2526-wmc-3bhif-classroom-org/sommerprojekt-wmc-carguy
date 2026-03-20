import express from "express";
import {PostService} from "./post-servie";
import { PostRepository } from "./post-repository";

const postService = new PostService(new PostRepository());
export const postRouter = express.Router();

postRouter.get("/posts", (req, res) => {
    const result = postService.getAllPosts();
    res.json(result);
});

postRouter.get("/posts/:id", (req, res) => {
    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }

    const result = postService.getPostById(id);

    if (!result) {
        return res.status(404).send("Post not found");
    }

    res.json(result);
});

postRouter.get("/posts/forum/:forumId", (req, res) => {
    const forumId = Number(req.params.forumId);

    if (typeof forumId !== "number") {
        return res.status(400).send("Invalid forumId");
    }

    const result = postService.getPostByForum(forumId);
    res.json(result);
});

postRouter.get("/posts/user/:userId", (req, res) => {
    const userId = Number(req.params.userId);

    if (typeof userId !== "number") {
        return res.status(400).send("Invalid userId");
    }

    const result = postService.getPostByUser(userId);
    res.json(result);
});

postRouter.get("/posts/category/:categoryId", (req, res) => {
    const categoryId = Number(req.params.categoryId);

    if (typeof categoryId !== "number") {
        return res.status(400).send("Invalid categoryId");
    }

    const result = postService.getPostByCategory(categoryId);
    res.json(result);
});