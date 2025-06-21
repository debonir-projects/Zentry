import { clerkClient } from "@clerk/express";
import express, { Request, Response, Router } from "express";

const router = Router();

// Simple GET endpoint to verify the postUser module is working
router.get("/user-status", (_req: Request, res: Response): void => {
  res.json({ status: "User service is running" });
});


router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;
  
  try {
    const user = await clerkClient.users.createUser({
      username,
      emailAddress: [email],
      password
    });
    res.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get user by ID endpoint
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const user = await clerkClient.users.getUser(userId);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all users endpoint
router.get("/getAll", async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await clerkClient.users.getUserList();
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;