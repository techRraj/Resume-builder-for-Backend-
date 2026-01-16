// backend/routes/payment.js
const express = require('express');
const { auth } = require('../middleware/auth');
const { upgradePlan } = require('../controllers/paymentController');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(auth);

// POST /api/payment/upgrade → upgrade subscription
router.post('/upgrade', upgradePlan);

module.exports = router;