const axios = require("axios");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";

const PAYPAL_API_URL =
  PAYPAL_MODE === "sandbox"
    ? "https://api.sandbox.paypal.com"
    : "https://api.paypal.com";

/**
 * Get PayPal Access Token
 */
const getAccessToken = async () => {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  console.log("PayPal Auth:", auth);
  try {
    const response = await axios.post(
      `${PAYPAL_API_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error(
      "PayPal Access Token Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to get PayPal access token");
  }
};

/**
 * Create a PayPal order (Checkout v2 API)
 */
const createOrder = async (req, res) => {
  try {
    const {
      amount,
      currency = "USD",
      orderDescription,
      pendingOrderId,
    } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const accessToken = await getAccessToken();
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: (amount / 100).toFixed(2), // Convert cents to dollars
          },
          description: orderDescription || "Order Payment",
          custom_id: pendingOrderId?.toString() || "",
        },
      ],
      application_context: {
        return_url: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/paypal/return`,
        cancel_url: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/paypal/cancel`,
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    };

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "PayPal Create Order Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to create PayPal order",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Capture an approved PayPal order
 */
const captureOrder = async (req, res) => {
  try {
    const { orderID, payerID, pendingOrderId } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: "orderID is required" });
    }

    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = response.data;

    // TODO: Update order in your database with PayPal payment details
    // Example database update:
    // await WooCommerceAPI.updateOrder(pendingOrderId, {
    //   payment_method: 'paypal',
    //   payment_method_title: 'PayPal',
    //   set_paid: true,
    //   meta_data: [
    //     { key: '_paypal_order_id', value: orderID },
    //     { key: '_paypal_payer_id', value: payerID }
    //   ]
    // });

    res.json({
      success: true,
      status: captureData.status,
      orderID: captureData.id,
      payer: captureData.payer,
      purchaseUnits: captureData.purchase_units,
    });
  } catch (error) {
    console.error(
      "PayPal Capture Order Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to capture PayPal order",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get PayPal order details
 */
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const accessToken = await getAccessToken();

    const response = await axios.get(
      `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(
      "PayPal Get Order Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Failed to get PayPal order details",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * PayPal return URL handler
 */
const handleReturn = (req, res) => {
  const { token, orderId } = req.query;

  res.json({
    success: true,
    message: "Payment approved, please complete the capture",
    paypalOrderId: token || orderId,
  });
};

/**
 * PayPal cancel URL handler
 */
const handleCancel = (req, res) => {
  res.status(400).json({
    success: false,
    message: "Payment cancelled by user",
  });
};

module.exports = {
  createOrder,
  captureOrder,
  getOrderDetails,
  handleReturn,
  handleCancel,
};
