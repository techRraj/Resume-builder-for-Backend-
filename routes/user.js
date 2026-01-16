// routes/users.js
const express = require('express');
const { auth } = require('../middleware/auth');
const { getCurrentUser, updateProfile } = require('../controllers/userController');

const router = express.Router();
router.use(auth);

router.get('/profile', getCurrentUser);
router.put('/profile', updateProfile);

module.exports = router;