// routes/webhook.js
const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhookController');

const router = express.Router();

// Raw body parser for Stripe
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;