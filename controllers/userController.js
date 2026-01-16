// controllers/userController.js
const User = require('../models/User');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};