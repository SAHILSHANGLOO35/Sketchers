import { NextFunction, Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken";

export interface RequestCustom extends Request
{
    userId?: string;
}

interface JwtPayload {
    userId: string
}

export function middleware(req: RequestCustom, res: Response, next: NextFunction) {
    const token = req.headers.authorization || "";

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if(decoded) {
        req.userId = decoded.userId;
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
}