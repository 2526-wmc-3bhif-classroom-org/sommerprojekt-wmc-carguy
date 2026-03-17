import express from "express";

export const userRouter = express.Router();

userRouter.get("/user", (req, res) => {

    res.json(result);

})

userRouter.get("/user:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }

})

userRouter.get("/user:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        res.json(result);
    }

})
