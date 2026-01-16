// server.js
const express = require('express');
const Resume = require('./models/Resume');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// const connectDB = require('./config/database');


// const Resume = require('./models/Resume'); // ← REQUIRED FOR DEBUG ROUTE

// Routes



const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const resumeRoutes = require('./routes/resume');
const templateRoutes = require('./routes/template');
const paymentRoutes = require('./routes/payment');
const webhookRoutes = require('./routes/webhook');

const connectDB = require('./config/database');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== TEMP DEBUG ROUTE - REMOVE BEFORE PRODUCTION =====
app.post('/api/debug-sync', async (req, res) => {
  const userId = "6969023dff6fd9dbafb58481"; // replace with real ID
  
  try {
    const { title, templateId, content } = req.body;
    if (!title || !templateId || !content) {
      return res.status(400).json({ error: 'Missing title, templateId, or content' });
    }

    // ✅ Now Resume is defined!
    const resume = new Resume({
      user: userId,
      title,
      template: templateId,
      content
    });

    await resume.save();
    res.json({ success: true, id: resume._id });
  } catch (err) {
    console.error('💥 ERROR:', err);
    res.status(500).json({ error: err.message });
  }
});
// ===========================
// =======================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My Custom Homepage</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            text-align: center;
            padding: 50px;
          }
          h1 {
            color: #333;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
          }
          .btn:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <h1>🚀 Welcome to My Server</h1>
        <p>This is a custom designed homepage for my Server of resume builder.</p>
        <a href="${process.env.FRONTEND_URL}" class="btn">Go to Frontend</a>
      </body>
    </html>
  `);
});