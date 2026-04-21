import {NextFunction} from "express";
import {StatusCodes} from "http-status-codes";
import * as jwt from 'jsonwebtoken';
import "dotenv/config"
import {AuthRequest} from "../../data/model";
import {JwtPayload} from "jsonwebtoken";
import type { Request, Response } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
    try {
        const head: string | undefined= req.header("authorization")?.replace("Bearer ", "");
        if(!head) {
            throw new Error("No token provided");
        }
        const payload = jwt.verify(head, process.env.SECRET_KEY || "test");
        (req as unknown as AuthRequest).payload = payload as JwtPayload;
        next();
    }catch (e) {
        if(e instanceof Error) {
            res.status(StatusCodes.UNAUTHORIZED).send({message: "No token provided"});
        }
    }
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
    try {
        const payload: JwtPayload = (req as unknown as AuthRequest).payload as JwtPayload;
        if(payload.user.role !== "admin") {
            throw new Error("You don't have permission to perform this action");
        }
        next();
    }catch (e) {
        if(e instanceof Error) {
            res.status(StatusCodes.FORBIDDEN).send({message: e.message});
        }
    }
}