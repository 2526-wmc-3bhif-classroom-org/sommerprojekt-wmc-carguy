import express from "express";
import {getAllUsers, getUserById} from "./user-service";
import {getAllPosts} from "../post/post-servie";

export const userRouter = express.Router();

userRouter.get("/user", (req, res) => {

    const result = getAllPosts();
    res.json(result);

})

userRouter.get("/user:id", (req, res) => {

    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }
    else{

        const result = getUserById(id);
        res.json(result);
    }

})
