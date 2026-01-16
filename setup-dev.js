const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up development environment...');

// Create frontend .env if not exists
const frontendEnvPath = path.join(__dirname, 'resume-maker-frontend', '.env');
if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51QK1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
REACT_APP_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
    `.trim();
    
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created frontend .env file');
}

// Create backend folder and .env if not exists
const backendDir = path.join(__dirname, 'backend');
if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir);
}

const backendEnvPath = path.join(backendDir, '.env');
if (!fs.existsSync(backendEnvPath)) {
    const backendEnvContent = `
MONGODB_URI=mongodb://localhost:27017/resume-builder
JWT_SECRET=your_super_secret_jwt_key_123456
PORT=5000
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_51QK1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
    `.trim();
    
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Created backend .env file');
}

// Create backend package.json
const backendPackagePath = path.join(backendDir, 'package.json');
if (!fs.existsSync(backendPackagePath)) {
    const backendPackage = {
        name: "resume-maker-backend",
        version: "1.0.0",
        main: "server.js",
        scripts: {
            "start": "node server.js",
            "dev": "nodemon server.js"
        },
        dependencies: {
            "express": "^4.18.2",
            "cors": "^2.8.5",
            "dotenv": "^16.0.3"
        },
        devDependencies: {
            "nodemon": "^3.0.1"
        }
    };
    
    fs.writeFileSync(backendPackagePath, JSON.stringify(backendPackage, null, 2));
    console.log('✅ Created backend package.json');
}

// Create the server.js file
const serverPath = path.join(backendDir, 'server.js');
if (!fs.existsSync(serverPath)) {
    const serverCode = `
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});

// Mock endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    res.json({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
            id: '1',
            name: 'Test User',
            email: email,
            subscription: 'premium',
            templates: []
        }
    });
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    res.json({
        token: 'mock-jwt-token-' + Date.now(),
        user: {
            id: '2',
            name: name,
            email: email,
            subscription: 'free',
            templates: []
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('🚀 Backend server running on http://localhost:' + PORT);
    console.log('✅ Health check: http://localhost:' + PORT + '/api/health');
});
    `.trim();
    
    fs.writeFileSync(serverPath, serverCode);
    console.log('✅ Created backend server.js');
}

console.log('\n📦 Installation Instructions:');
console.log('1. Navigate to backend folder: cd backend');
console.log('2. Install dependencies: npm install');
console.log('3. Start backend: npm run dev');
console.log('4. In another terminal, start frontend: npm start');
console.log('\n🌐 Your app will be available at: http://localhost:3000');