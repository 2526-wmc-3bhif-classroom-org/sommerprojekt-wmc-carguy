import express from "express";

export const commentRouter = express.Router();

commentRouter.get("/comment:id", (req, res) => {

    res.json(result);

})

commentRouter.get("/comment:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }

})

commentRouter.get("/comment:postId", (req, res) => {

    const postId = Number(req.params.id);

    if (typeof postId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }

})

commentRouter.get("/comment:parentCommentId", (req, res) => {

    const parentCommentId = Number(req.params.id);

    if (typeof parentCommentId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }

})