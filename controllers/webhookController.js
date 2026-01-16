// controllers/webhookController.js
const User = require('../models/User');
const stripeService = require('../services/stripeService');

exports.handleStripeWebhook = async (req, res) => {
  let event;
  try {
    event = stripeService.constructEvent(req.rawBody, req.headers['stripe-signature']);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details.email;
    const plan = session.metadata?.plan || 'premium';

    const user = await User.findOne({ email });
    if (user) {
      // 🔥 UPDATE SUBSCRIPTION
      user.subscription = {
        plan,
        status: 'active',
        stripeCustomerId: session.customer.id,
        currentPeriodEnd: null // set from subscription if needed
      };
      await user.save();
    }
  }

  res.json({ received: true });
};