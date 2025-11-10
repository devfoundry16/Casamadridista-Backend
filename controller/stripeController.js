const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY); // Use test secret key
const createPaymentIntent = async (req, res) => {
  const { amount, orderId, user } = req.body; // Amount in cents (e.g., 1000 for $10)

  console.log("amount:", amount, "orderId:", orderId, "user:", user);

  try {
    const customer = await stripeInstance.customers.create({
      name: user.name,
      email: user.email,
      address: user.address,
    });
    const ephemeralKey = await stripeInstance.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2025-09-30.clover" }
    );
    // Optionally create/retrieve a Stripe customer for the user
    const args = {
      amount: amount * 100,
      currency: "usd",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: orderId },
    };
    const paymentIntent = await stripeInstance.paymentIntents.create(args);
    console.log(paymentIntent);
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      error: false,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};
const createPaymentMethod = async (req, res) => {
  // Implementation for creating a payment method if needed
  const { cardDetails, billingDetails } = req.body;

  try {
    const paymentMethod = await stripeInstance.paymentMethods.create({
      type: "card",
      card: {
        number: cardDetails.number,
        exp_month: cardDetails.exp_month,
        exp_year: cardDetails.exp_year,
        cvc: cardDetails.cvc,
      },
      billing_details: {
        name: billingDetails.name,
        email: billingDetails.email,
        address: billingDetails.address,
      },
    });

    res.json({ paymentMethodId: paymentMethod.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  createPaymentMethod,
  createWebhookHandler,
};
