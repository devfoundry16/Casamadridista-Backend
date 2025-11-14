const express = require("express");
const router = express.Router();
const {
  createOrder,
  captureOrder,
  getOrderDetails,
  handleReturn,
  handleCancel,
} = require("../controller/paypalController");

/**
 * PayPal Checkout v2 Routes
 * @route POST /paypal/create-order - Create a PayPal order
 * @route POST /paypal/capture-order - Capture an approved PayPal order
 * @route GET /paypal/order/:orderId - Get PayPal order details
 * @route GET /paypal/return - Handle PayPal return (success)
 * @route GET /paypal/cancel - Handle PayPal cancel
 */

// Create PayPal order
router.post("/create-order", createOrder);

// Capture PayPal order
router.post("/capture-order", captureOrder);

// Get order details
router.get("/order/:orderId", getOrderDetails);

// Return URL handler
router.get("/return", handleReturn);

// Cancel URL handler
router.get("/cancel", handleCancel);

module.exports = router;
