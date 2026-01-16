// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;