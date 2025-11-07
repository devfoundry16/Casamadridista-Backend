// server/routes/paypal.js
const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  executePayment,
} = require("../controller/paypalController");
// Create payment
router.post("/create-payment", createPaymentIntent);

// Execute payment
router.post("/execute-payment", executePayment);

module.exports = router;
