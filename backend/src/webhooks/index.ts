import express from 'express';
import { clerkWebhook } from './clerk';
import { webhookParser } from '../middleware/webhook-parser';

const router = express.Router();

// Apply raw body parser middleware specifically for this route
router.post('/clerk', webhookParser, clerkWebhook);

export default router;