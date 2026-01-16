// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  let token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Invalid token' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { auth };