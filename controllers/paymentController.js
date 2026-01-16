// backend/controllers/paymentController.js
const User = require('../models/User');

/**
 * Upgrade user subscription plan (mock implementation)
 * Expects: { plan: 'premium' | 'vip' }
 */
exports.upgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate plan
    const validPlans = ['premium', 'vip'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid plan. Choose "premium" or "vip".' 
      });
    }

    // Find and update user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.subscription.plan = plan;
    await user.save();

    // Return updated user data (without password)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription.plan
      }
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upgrade plan. Please try again.' 
    });
  }
};