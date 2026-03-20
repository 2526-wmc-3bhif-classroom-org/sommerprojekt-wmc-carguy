import express from "express";

import {getPostById, getPostByUser, getAllPosts, getPostByCategory, getPostByForum} from "./post-servie";

export const postRouter = express.Router();

postRouter.get("/posts", (req, res) => {

    const result = getAllPosts();
    res.json(result);
})

postRouter.get("/posts:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{
        const result = getPostById(id);
        res.json(result);
    }


})

postRouter.get("/posts:forum", (req, res) => {
    const forumId = Number(req.params.id);

    if (typeof forumId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        const result = getPostByForum(forumId);
        res.json(result);
    }
})

postRouter.get("/posts/:userId", (req, res) => {

    const userId = Number(req.params.id);

    if (typeof userId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        const result = getPostByUser(userId);
        res.json(result);
    }
})

postRouter.get("/posts/:category", (req, res) => {

    const categoryId = Number(req.params.id);

    if (typeof categoryId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        const result = getPostByCategory(categoryId);
        res.json(result);
    }
})



