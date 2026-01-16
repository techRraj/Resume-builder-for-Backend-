// controllers/templateController.js
const Template = require('../models/Template');

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findOne({ id: req.params.id });
    if (!template) return res.status(404).json({ message: 'Not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};