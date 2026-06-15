import { StatusCodes } from "http-status-codes";
import express, { Request, Response} from "express";
import { UserService } from "./user-service";
import { UserRepository } from "./user-repository";
import {User, UserClaims, UserInput} from "../../data/model";
import * as jwt from "jsonwebtoken";
import { requireAuth } from "../auth-middleware";
import { JWT_SECRET } from "../config";

const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const userRouter = express.Router();

userRouter.get("/users", (req, res) => {
    const result = userService.getAllUsers();
    res.json(result);
});

userRouter.get("/user/:id", (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send("Invalid id");
    }

    const result = userService.getUserById(id);

    if (!result) {
        return res.status(404).send("User not found");
    }

    res.json(result);
});

userRouter.post("/user", requireAuth, (req, res) => {
    const user: User = req.body;

    userService.createUser(user);

    res.status(201).json({ message: "User created" });
});

userRouter.post("/login", async (req: Request, res: Response) => {
    const user: UserInput = req.body;
    if(!user || user.username === undefined || user.password === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).send("Body not in correct format");
    }
    try {
        const claims: UserClaims | undefined = userService.checkUserCredentials(user);
        if(claims === undefined) throw new Error("User credentials not found");
        const minutes = 15;
        const expiresAt = new Date(Date.now() + minutes * 60000);
        const token = jwt.sign(
            {
                user: claims,
                exp: expiresAt.getTime() / 1000,
            },
            JWT_SECRET,
        )
        return res.status(StatusCodes.OK).send({userClaims: claims,
            expiresAt: expiresAt,
            accessToken: token,
            user: userService.getUserByUsername(user.username)
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
        let user = userService.createNewUser(body);
        const claims: UserClaims = { username: user.username, role: user.role };
        const minutes = 15;
        const expiresAt = new Date(Date.now() + minutes * 60000);
        const token = jwt.sign(
            { user: claims, exp: expiresAt.getTime() / 1000 },
            JWT_SECRET,
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

userRouter.post("/update", requireAuth, (req: Request, res: Response) => {
    try {
        if (!(req as any).user) {
            return res.status(StatusCodes.UNAUTHORIZED).send("Unauthorized");
        }
        const realUserName: string = (req as any).user.username;

        const newUserName: string = req.body.newUsername;
        const newPublicName: string = req.body.newPublicName;
        const newDescription: string = req.body.newDescription;
        const newImage: string = req.body.newImage;

        let user = userService.updateUserInfo(realUserName, {
            username: newUserName,
            publicname: newPublicName,
            description: newDescription,
            image: newImage
        } as User);

        return res.status(StatusCodes.OK).send({
            message: "User updated successfully",
            user: userService.getUserByUsername(user.username)
        });
    } catch (err) {
        if (err instanceof Error) {
            return res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: "An unexpected error occurred" });
    }

})