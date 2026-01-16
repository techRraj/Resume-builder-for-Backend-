// middleware/premium.js
const checkPremium = (requiredPlan = 'premium') => {
  return (req, res, next) => {
    const userPlan = req.user.subscription.plan;
    const levels = { free: 0, basic: 1, premium: 2, vip: 3 };
    if (levels[userPlan] >= levels[requiredPlan]) {
      return next();
    }
    res.status(403).json({ message: 'Upgrade required', required: requiredPlan });
  };
};

module.exports = checkPremium;