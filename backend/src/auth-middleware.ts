import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { UserClaims } from "../data/model";
import { StatusCodes } from "http-status-codes";

// Extend Express Request to include our custom user property
declare global {
  namespace Express {
    interface Request {
      user?: UserClaims;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || "12345") as { user: UserClaims, exp: number };
    
    // Attach the decoded user claims to the request object
    req.user = decoded.user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token has expired" });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token is not valid" });
  }
};
