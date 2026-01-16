// controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = await User.create({ name, email, password ,subscription: { plan: 'free' },
      usage: { resumesCreated: 0, downloads: 0, templatesUsed: [] }});
    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, subscription: user.subscription.plan }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription.plan
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = user.createPasswordResetToken();
    await user.save();
    // In prod: send email with link: `${FRONTEND_URL}/reset-password/${resetToken}`
    res.json({ message: 'Password reset token generated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const hashedToken = require('crypto').createHash('sha256').update(req.params.token).digest('hex');
  try {
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Token invalid or expired' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ token: generateToken(user._id), message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};