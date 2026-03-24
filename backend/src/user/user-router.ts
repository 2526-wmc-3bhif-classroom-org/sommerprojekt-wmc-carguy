import express from "express";
import { UserService } from "./user-service";
import { UserRepository } from "./user-repository";
import {User} from "../../data/model";

export const userRouter = express.Router();

const userService = new UserService(new UserRepository());

userRouter.get("/users", (req, res) => {
    const result = userService.getAllUsers();
    res.json(result);
});

userRouter.get("/user/:id", (req, res) => {
    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }

    const result = userService.getUserById(id);

    if (!result) {
        return res.status(404).send("User not found");
    }

    res.json(result);
});

userRouter.post("/user", (req, res) => {
    const user: User = req.body;

    userService.createUser(user);

    res.status(201).json({ message: "User created" });
});