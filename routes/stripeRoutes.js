const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  createPaymentMethod,
  createWebhookHandler,
} = require("../controller/stripeController.js");

router.post("/create-payment-intent", createPaymentIntent);

router.post("/create-payment-method", createPaymentMethod);
// Webhook for handling payment success (recommended for production-like simulation)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  createWebhookHandler
);

module.exports = router;
