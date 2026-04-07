import express, {response} from "express";
import { UserService } from "./user-service";
import { UserRepository } from "./user-repository";
import {User} from "../../data/model";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const SECRET_KEY = "your_ultra_secure_secret_key"; // This should ideally be an environment variable

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

userRouter.post("/user/login", (req, res) => {
    const { username: userNameClientSide, password: passwordClientSide } = req.body;

    const user = userService.getUserByUsername(userNameClientSide);

    if (!user) {
        return res.status(404).json("User does not exist");
    }

    const isPasswordValid = bcrypt.compareSync(passwordClientSide, user.password);
    if (!isPasswordValid) {
        return res.status(401).json("Wrong password");
    }

    const userClaims = {
        email: user.email,
        role: user.role,
    };

    const minutes = 15;

    const token = jwt.sign(
        { user: userClaims },
        SECRET_KEY,
        { expiresIn: `${minutes}m` }
    );

    res.json({ token });
});