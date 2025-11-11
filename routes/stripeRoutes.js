const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  createCustomer,
  createWebhookHandler,
} = require("../controller/stripeController.js");

router.post("/create-payment-intent", createPaymentIntent);
router.post("/create-cusomer", createCustomer);
// Webhook for handling payment success (recommended for production-like simulation)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  createWebhookHandler
);

module.exports = router;
