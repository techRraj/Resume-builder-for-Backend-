const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Resume Builder Backend...\n');

// Create necessary directories
const directories = [
  'controllers',
  'models',
  'routes',
  'middleware',
  'services',
  'seeds',
  'uploads',
  'exports',
  'email-templates'
];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/resume_builder

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Payments (get from stripe.com dashboard)
STRIPE_SECRET_KEY=sk_test_51QK1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_BASIC_PLAN_ID=price_basic_monthly
STRIPE_PREMIUM_PLAN_ID=price_premium_monthly
STRIPE_VIP_PLAN_ID=price_vip_monthly

# File Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# App Settings
APP_NAME=ResumeBuilder Pro
APP_URL=http://localhost:3000
  `.trim();
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
}

// Create package.json if it doesn't exist
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
  const packageJson = {
    name: "resume-builder-backend",
    version: "1.0.0",
    description: "Backend API for Resume Builder Application",
    main: "server.js",
    scripts: {
      "start": "node server.js",
      "dev": "nodemon server.js",
      "test": "jest",
      "seed": "node seeds/seed.js"
    },
    dependencies: {
      "bcryptjs": "^2.4.3",
      "cors": "^2.8.5",
      "dotenv": "^16.0.3",
      "express": "^4.18.2",
      "express-rate-limit": "^6.11.0",
      "express-validator": "^7.0.1",
      "helmet": "^7.0.0",
      "jsonwebtoken": "^9.0.0",
      "mongoose": "^7.5.0",
      "multer": "^1.4.5-lts.1",
      "nodemailer": "^6.9.4",
      "pdfkit": "^0.14.0",
      "sharp": "^0.32.6",
      "stripe": "^14.6.0",
      "winston": "^3.10.0"
    },
    devDependencies: {
      "nodemon": "^3.0.1"
    }
  };
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Created package.json');
}

console.log('\n📦 Installation Instructions:');
console.log('1. Install dependencies: npm install');
console.log('2. Start MongoDB: mongod (or use MongoDB Atlas)');
console.log('3. Run seed data: npm run seed');
console.log('4. Start backend: npm run dev');
console.log('\n🌐 Backend will be available at: http://localhost:5000');
console.log('🩺 Health check: http://localhost:5000/api/health');

// Run npm install if package.json was just created
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('\n📥 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    console.log('Please run "npm install" manually');
  }
}