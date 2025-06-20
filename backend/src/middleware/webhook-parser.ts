import express from 'express';

// Middleware for parsing webhook payloads
// We need the raw body for signature verification
export const webhookParser = express.raw({
  type: 'application/json',
  verify: (req, res, buf) => {
    console.log("webhook running");
  }
});