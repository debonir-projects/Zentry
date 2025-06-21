import express, { Express } from "express";
import { authMiddleware } from "../middleware/auth"; // Adjust path if needed
import { postTransactionById,getAllUsersTransactions,getTransactionById,updateTransactionById,deleteTransactionById } from "./transactions/transactions";
import { uploadCloudinaryAndAnalyze, uploadMiddleware } from "./imageUpload/analyseAndUpload";
import multer from "multer";
// Initialize app
const app: Express = express();
const router = express.Router();
// Mount router
const upload = multer({ dest: "uploads/" }); // Set up multer for file uploads
// Initialize app


// Use your Prisma-based auth middleware
router.post("/postTransactionById/:userId", postTransactionById);
router.get("/getUserTransactions", getAllUsersTransactions);
router.get("/getTransactionById/:id", getTransactionById);
router.put("/updateTransactionById/:id", updateTransactionById);
router.delete("/deleteTransactionById/:id", deleteTransactionById);
router.post("/uploadCloudinary/:userId", uploadMiddleware, uploadCloudinaryAndAnalyze);

router.post("/upload/:userId", uploadMiddleware, uploadCloudinaryAndAnalyze);
// Mount router
app.use(router);

export default {
  router,
  app
} 