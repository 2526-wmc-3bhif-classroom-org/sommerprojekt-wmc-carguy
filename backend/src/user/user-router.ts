import { StatusCodes } from "http-status-codes";
import express, { Request, Response} from "express";
import { UserService } from "./user-service";
import { UserRepository } from "./user-repository";
import {User, UserClaims, UserInput} from "../../data/model";
import * as jwt from "jsonwebtoken";

export const userRouter = express.Router();

userRouter.get("/users", (req, res) => {
    const result = UserService.getAllUsers();
    res.json(result);
});

userRouter.get("/user/:id", (req, res) => {
    const id = Number(req.params.id);

    if (typeof id !== "number") {
        return res.status(400).send("Invalid id");
    }

    const result = UserService.getUserById(id);

    if (!result) {
        return res.status(404).send("User not found");
    }

    res.json(result);
});

import { requireAuth } from "../auth-middleware";

userRouter.post("/user", requireAuth, (req, res) => {
    const user: User = req.body;

    UserService.createUser(user);

    res.status(201).json({ message: "User created" });
});

userRouter.post("/login", async (req: Request, res: Response) => {
    const user: UserInput = req.body;
    if(!user || user.username === undefined || user.password === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).send("Body not in correct format");
    }
    try {
        const claims: UserClaims | undefined=UserService.checkUserCredentials(user);
        if(claims === undefined) throw new Error("User credentials not found");
        const minutes = 15;
        const expiresAt = new Date(Date.now() + minutes * 60000);
        const token = jwt.sign(
            {
                user: claims,
                exp: expiresAt.getTime() / 1000,
            },
            process.env.SECRET_KEY || "12345",
        )
        return res.status(StatusCodes.OK).send({userClaims: claims,
            expiresAt: expiresAt,
            accessToken: token,
            user: UserService.getUserByUsername(user.username)
        });
    }catch(err) {
        if(err instanceof Error) {
            return res.status(StatusCodes.UNAUTHORIZED).send({message: err.message});
        }
    }
})

userRouter.post("/register", (req: Request, res: Response) => {
    try {
        const body: UserInput = req.body as UserInput;
        let user = UserService.createNewUser(body);
        const claims: UserClaims = { username: user.username, role: user.role };
        const minutes = 15;
        const expiresAt = new Date(Date.now() + minutes * 60000);
        const token = jwt.sign(
            { user: claims, exp: expiresAt.getTime() / 1000 },
            process.env.SECRET_KEY || "12345",
        );
        return res.status(StatusCodes.CREATED).send({
            userClaims: claims,
            expiresAt: expiresAt,
            accessToken: token,
            user: user
        });
    }catch(err) {
        if(err instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).send({message: err.message});
        }
    }
})

userRouter.post("/update", (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const realUserName: string = req.body.username;

        const newUserName: string = req.body.newUsername;
        const newPublicName: string = req.body.newPublicName;
        const newDescription: string = req.body.newDescription;

        let user = UserService.updateUserInfo(realUserName, {username: newUserName, publicname: newPublicName, description: newDescription} as User);

        return res.status(StatusCodes.OK).send({
            message: "User updated successfully",
            user: UserService.getUserByUsername(user.username)
        });
    } catch (err) {
        if (err instanceof Error) {
            return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "An unexpected error occurred" });
    }
})