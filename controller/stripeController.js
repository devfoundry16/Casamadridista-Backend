const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY); // Use test secret key
const createPaymentIntent = async (req, res) => {
  const { amount, orderId, user, stripeCustomerId } = req.body; // Amount in cents (e.g., 1000 for $10)

  console.log(
    "amount:",
    amount,
    "orderId:",
    orderId,
    "user address:",
    user.address,
    "customerId:",
    stripeCustomerId
  );
  try {
    let customerId = stripeCustomerId;
    if (customerId == "") {
      const customer = await stripeInstance.customers.create({
        name: user.name,
        email: user.email,
        address: user.address,
      });
      customerId = customer.id;
    }
    const ephemeralKey = await stripeInstance.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2025-09-30.clover" }
    );

    const args = {
      amount: amount * 100,
      currency: "usd",
      customer: customerId,
      payment_method: "pm_card_visa",
      metadata: { order_id: orderId },
    };
    const paymentIntent = await stripeInstance.paymentIntents.create(args);
    res.json({
      paymentIntentId: paymentIntent.id,
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerId,
      error: false,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
const createCustomer = async (req, res) => {
  const { user } = req.body;
  const customer = await stripeInstance.customers.create({
    name: user.name,
    email: user.email,
    address: user.address,
  });
  res.json({ customerId: customer.id });
};
const createWebhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = "whsec_your_webhook_secret"; // From Stripe dashboard

  try {
    const event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const {
        amount,
        metadata: { userId },
      } = paymentIntent;
      // Update virtual wallet balance in your database
      // e.g., await db.updateUserBalance(userId, amount / 100);
      console.log(`Added ${amount / 100} to user ${userId}'s wallet`);
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

module.exports = {
  createPaymentIntent,
  createCustomer,
  createWebhookHandler,
};
