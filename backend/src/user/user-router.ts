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

userRouter.post("/user", (req, res) => {
    const user: User = req.body;

    UserService.createUser(user);

    res.status(201).json({ message: "User created" });
});

userRouter.post("/login", async (req: Request, res: Response) => {
    const user: UserInput = req.body;
    if(!user || user.email === undefined || user.password === undefined) {
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
        UserService.createNewUser(body);
        return res.status(StatusCodes.CREATED).send({message: "User created successfully"});
    }catch(err) {
        if(err instanceof Error) {
            res.status(StatusCodes.BAD_REQUEST).send({message: err.message});
        }
    }
})