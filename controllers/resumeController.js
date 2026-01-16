// controllers/resumeController.js
const Resume = require('../models/Resume');
const Template = require('../models/Template');
const User = require('../models/User');

// GET /api/resumes → for Dashboard.jsx
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resumes' });
  }
};

exports.createResume = async (req, res) => {
  const { title, templateId, content, style } = req.body;
  const userId = req.user.id;

  // Validate template access
  const template = await Template.findById(templateId);
  if (!template || !template.canUserAccess(req.user.subscription.plan)) {
    return res.status(403).json({ message: 'Template access denied' });
  }

  // Create resume
  const resume = new Resume({
    user: userId,
    template: templateId,
    title: title || 'Untitled Resume',
    content: content || {},
    style: style || {}
  });
  await resume.save();

  // 🔥 TRACK TEMPLATE USAGE IN USER
  const user = await User.findById(userId);
  const existing = user.usage.templatesUsed.find(t => t.templateId.toString() === templateId);
  if (existing) {
    existing.count += 1;
  } else {
    user.usage.templatesUsed.push({ templateId, count: 1 });
  }
  user.usage.resumesCreated += 1;
  await user.save();

  // 🔥 UPDATE TEMPLATE POPULARITY
  await template.incrementUsage(); // already defined in your model

  res.status(201).json(resume);
};

exports.updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Not found' });
    resume.data = req.body.data;
    resume.title = req.body.title;
    resume.version += 1;
    await resume.save();
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const result = await Resume.deleteOne({ _id: req.params.id, user: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.exportPDF = async (req, res) => {
  const { id } = req.params;
  const resume = await Resume.findById(id).populate('template');
  if (!resume || resume.user.toString() !== req.user.id) {
    return res.status(404).json({ message: 'Not found' });
  }

  // 🔥 Increment download count
  resume.downloads += 1;
  resume.lastPrinted = new Date();
  await resume.save();

  // 🔥 Update user download count
  const user = await User.findById(req.user.id);
  user.usage.downloads += 1;
  await user.save();

  // Generate PDF (client-side for now, or use pdfkit later)
  res.json({
    success: true,
    message: 'PDF ready',
    resumeId: resume._id,
    filename: `${resume.title.replace(/\s+/g, '_')}.pdf`
  });
};

exports.syncResume = async (req, res) => {
  console.log('🔄 Sync request received');
  console.log('👤 User from token:', req.user); // 🔍 DEBUG: Is user present?

  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const { title, templateId, content } = req.body;
  const userId = req.user.id;

  if (!title || !templateId || !content) {
    return res.status(400).json({ message: 'Missing required fields: title, templateId, or content' });
  }

  try {
    let resume = await Resume.findOne({ user: userId, title });
    if (!resume) {
      resume = new Resume({ user: userId, title, template: templateId, content });
    } else {
      resume.content = content;
      resume.template = templateId;
      resume.version += 1;
    }
    await resume.save();

    // Track usage
    const user = await User.findById(userId);
    const existing = user.usage.templatesUsed.find(t => t.templateId === templateId);
    if (existing) {
      existing.count += 1;
    } else {
      user.usage.templatesUsed.push({ templateId, count: 1 });
    }
    user.usage.resumesCreated += 1;
    await user.save();

    res.status(200).json({ success: true, resumeId: resume._id });
  } catch (err) {
    console.error('❌ Sync error:', err); // 🔥 THIS IS KEY!
    res.status(500).json({ message: 'Failed to sync resume' });
  }
};

// POST /api/resumes/:id/download → track PDF download
exports.trackDownload = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Not found' });

    resume.downloads += 1;
    resume.lastPrinted = new Date();
    await resume.save();

    const user = await User.findById(req.user.id);
    user.usage.downloads += 1;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to track download' });
  }
};
// POST /api/resumes/:id/export/pdf → called on download
exports.exportPDF = async (req, res) => {
  // Increment resume.downloads & user.usage.downloads
  // Return success (PDF generated client-side)
};