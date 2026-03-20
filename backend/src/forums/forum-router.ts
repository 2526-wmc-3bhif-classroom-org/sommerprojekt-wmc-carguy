import express from "express";
import {getForumByCategory, getForumById, getAllForums} from "./forum-service";

export const forumRouter = express.Router();

forumRouter.get("/forum", (req, res) => {

    const result = getAllForums();
    res.json(result);
})

forumRouter.get("/forum:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        const result = getForumById(id);
        res.json(result);
    }

})

forumRouter.get("/forum:categoryId", (req, res) => {

    const categoryId = Number(req.params.id);

    if (typeof categoryId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        const result = getForumByCategory(categoryId);
        res.json(result);
    }

})