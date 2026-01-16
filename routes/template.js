// routes/templates.js
const express = require('express');
const { getAllTemplates, getTemplateById } = require('../controllers/templateController');

const router = express.Router();

router.get('/', (req, res) => {
  res.json([
    { id: 'modern', name: 'Modern', category: 'free' },
    { id: 'minimal', name: 'Minimal', category: 'free' },
    { id: 'executive', name: 'Executive', category: 'premium' },
    { id: 'tech-pro', name: 'Tech Pro', category: 'vip' }
  ]);
});
router.get('/:id', getTemplateById);

module.exports = router;