import express, { Express } from "express";
import { authMiddleware } from "../middleware/auth"; // Adjust path if needed


// Initialize app
const app: Express = express();
const router = express.Router();
// Mount router
app.use(router);

export default {
  router,
  app
} 