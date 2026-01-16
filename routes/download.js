// routes/download.js
const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/:id', downloadController.downloadResume);

module.exports = router;