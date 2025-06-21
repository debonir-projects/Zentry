import { clerkClient } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import prisma from "../db/db";

// Extend Request to include `auth` field
interface AuthenticatedRequest extends Request {
  auth: {
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
    // Use Clerk to verify the token
    // Extract session ID and token from the provided token
    const [sessionId, sessionToken] = token.split('_');
    const session = await clerkClient.sessions.verifySession(sessionId, sessionToken);
    const clerkUserId = session.userId;
    
    // Find the user in your database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      res.status(401).json({ error: "User not found in database" });
      return;
    }

    req.auth = { userId: user.clerkUserId };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Invalid authentication token" });
  }
};