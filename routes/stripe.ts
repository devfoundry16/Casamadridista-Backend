import express from "express";
const router = express.Router();
import {
  createPaymentIntent,
  createPaymentMethod,
  createWebhookHandler,
} from "../controller/stripeController";
import { create } from "domain";

router.post("/create-payment-intent", createPaymentIntent);

router.post("/create-payment-method", createPaymentMethod);
// Webhook for handling payment success (recommended for production-like simulation)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  createWebhookHandler
);

export default router;
