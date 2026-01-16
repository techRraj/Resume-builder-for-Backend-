const Stripe = require('stripe');

class StripeService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        this.plans = {
            free: null,
            basic: process.env.STRIPE_BASIC_PLAN_ID,
            premium: process.env.STRIPE_PREMIUM_PLAN_ID,
            vip: process.env.STRIPE_VIP_PLAN_ID
        };
    }

    async createCustomer(email, name) {
        return await this.stripe.customers.create({
            email,
            name,
            metadata: { source: 'resume-builder' }
        });
    }

    async createSubscription(customerId, planId) {
        return await this.stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: planId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });
    }

    async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
        return await this.stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: customerId
            }
        });
    }

    async cancelSubscription(subscriptionId) {
        return await this.stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });
    }

    async updateSubscription(subscriptionId, newPlanId) {
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        
        return await this.stripe.subscriptions.update(subscriptionId, {
            items: [{
                id: subscription.items.data[0].id,
                price: newPlanId
            }]
        });
    }

    async verifyWebhookSignature(payload, signature) {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }
}

module.exports = new StripeService();