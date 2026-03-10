import express from "express";

export const postRouter = express.Router();

postRouter.get("/posts", (req, res) => {


    res.json(result);


})

postRouter.get("/posts:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }


})

postRouter.get("/posts:forum", (req, res) => {
    const forumId = Number(req.params.id);

    if (typeof forumId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }
})

postRouter.get("/posts/:userId", (req, res) => {

    const userId = Number(req.params.id);

    if (typeof userId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }
})

postRouter.get("/posts/:category", (req, res) => {

    const categoryId = Number(req.params.id);

    if (typeof categoryId !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }
})



