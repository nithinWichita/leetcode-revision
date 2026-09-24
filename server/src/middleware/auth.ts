import "dotenv/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined");
}
const JWT_SECRET: string = jwtSecret;
export interface AuthenticatedRequest extends Request {
    userId?: number;
}
export function authenticate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Not authenticated",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "number"
        ) {
            return res.status(401).json({
                message: "Invalid token",
            });
        }

        req.userId = decoded.userId;

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}
