import express, { Express } from "express";
import { authMiddleware } from "../middleware/auth"; // Adjust path if needed
import { postTransactionById,getAllUsersTransactions,getTransactionById,updateTransactionById,deleteTransactionById } from "./transactions/transactions";

// Initialize app
const app: Express = express();
const router = express.Router();
// Mount router
// Use your Prisma-based auth middleware
router.post("/postTransactionById/:userId", authMiddleware, postTransactionById);
router.get("/getUserTransactions",  getAllUsersTransactions);
router.get("/getTransactionById/:id", authMiddleware, getTransactionById);
router.put("/updateTransactionById/:id", authMiddleware, updateTransactionById);
router.delete("/deleteTransactionById/:id", authMiddleware, deleteTransactionById);
export default {
  router,
  app
} 