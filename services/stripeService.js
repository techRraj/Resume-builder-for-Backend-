// services/stripeService.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createCheckoutSession(customerEmail, priceId, successUrl, cancelUrl) {
    return await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });
  }

  async constructEvent(payload, sigHeader) {
    return stripe.webhooks.constructEvent(payload, sigHeader, process.env.STRIPE_WEBHOOK_SECRET);
  }
}

module.exports = new StripeService();