const axios = require("axios");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL; // Use live for production

// Generate access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString(
    "base64"
  );

  try {
    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
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
    console.error("Error getting access token:", error);
    throw error;
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "USD", description } = req.body;
    const accessToken = await getAccessToken();

    const paymentData = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      transactions: [
        {
          amount: {
            total: amount,
            currency: currency,
          },
          description: description,
        },
      ],
      redirect_urls: {
        return_url: "https://your-app.com/success",
        cancel_url: "https://your-app.com/cancel",
      },
    };

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/payments/payment`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Find approval URL
    const approvalUrl = response.data.links.find(
      (link) => link.rel === "approval_url"
    ).href;

    res.json({
      paymentId: response.data.id,
      approvalUrl: approvalUrl,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
};
const executePayment = async (req, res) => {
  try {
    const { paymentId, payerId } = req.body;
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `${PAYPAL_BASE_URL}/v1/payments/payment/${paymentId}/execute`,
      { payer_id: payerId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      payment: response.data,
    });
  } catch (error) {
    console.error("Error executing payment:", error);
    res.status(500).json({ error: "Failed to execute payment" });
  }
};

module.exports = { createPaymentIntent, executePayment };
