import { Request, Response, NextFunction } from "express";
import prisma from "../db/db";
import requiredAuth from '@clerk/express'

// Extend Request to include `auth` field
interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const user = await prisma.user.findUnique({
      where: { id: token },
    });

    if (!user) {
      res.status(401).json({ error: "User not found in database" });
      return;
    }

    req.auth = { userId: user.id };
    next(); // Proceed to the route handler
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal server error in auth" });
    return;
  }
};