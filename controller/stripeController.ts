import { Request, Response } from "express";
import Stripe from "stripe";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY as string); // Use test secret key
export const createPaymentIntent = async (req: Request, res: Response) => {
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
    const args: Stripe.PaymentIntentCreateParams = {
      amount,
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
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const createPaymentMethod = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const createWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
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
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
