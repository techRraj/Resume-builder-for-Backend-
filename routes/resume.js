// routes/resumes.js
const express = require('express');
const { auth } = require('../middleware/auth');
const { syncResume, trackDownload, getAllResumes, createResume, updateResume, deleteResume } = require('../controllers/resumeController');

const router = express.Router();
router.use(auth);
router.post('/sync', syncResume);
router.post('/:id/download', trackDownload);
router.get('/', getAllResumes);

router.get('/', getAllResumes);
router.post('/', createResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

module.exports = router;