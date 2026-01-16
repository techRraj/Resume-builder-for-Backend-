// backend/models/Payments.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

// Apply auth middleware to all payment routes
router.use(auth);

// Payment routes
router.post('/checkout', paymentController.createCheckoutSession);
router.get('/success', paymentController.handlePaymentSuccess);
router.get('/status', paymentController.getSubscriptionStatus);
router.post('/cancel', paymentController.cancelSubscription);
router.post('/reactivate', paymentController.reactivateSubscription);

module.exports = router;