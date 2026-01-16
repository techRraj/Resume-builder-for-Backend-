const mongoose = require('mongoose');
const User = require('../models/User');
const Template = require('../models/Template');
require('dotenv').config();

const templates = [
    {
        name: 'Modern Dev',
        description: 'Clean, professional design perfect for tech roles',
        category: 'free',
        thumbnail: 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=Modern+Dev',
        layout: 'modern',
        features: ['ATS Friendly', 'Modern Design', 'Free'],
        tags: ['tech', 'developer', 'modern']
    },
    {
        name: 'Minimal',
        description: 'Simple and elegant design for any industry',
        category: 'free',
        thumbnail: 'https://via.placeholder.com/300x400/6b7280/ffffff?text=Minimal',
        layout: 'single-column',
        features: ['Simple', 'Clean', 'Free'],
        tags: ['minimal', 'simple', 'elegant']
    },
    {
        name: 'Executive',
        description: 'Professional design for senior roles and executives',
        category: 'premium',
        thumbnail: 'https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Executive',
        layout: 'classic',
        price: { amount: 9.99, currency: 'USD' },
        features: ['Executive Style', 'Premium', 'ATS Optimized'],
        tags: ['executive', 'professional', 'senior']
    },
    {
        name: 'Creative',
        description: 'Unique design for creative professionals',
        category: 'premium',
        thumbnail: 'https://via.placeholder.com/300x400/ec4899/ffffff?text=Creative',
        layout: 'creative',
        price: { amount: 12.99, currency: 'USD' },
        features: ['Unique Design', 'Creative', 'Premium'],
        tags: ['creative', 'designer', 'unique']
    },
    {
        name: 'Tech Pro',
        description: 'Advanced template for tech professionals with skill charts',
        category: 'vip',
        thumbnail: 'https://via.placeholder.com/300x400/10b981/ffffff?text=Tech+Pro',
        layout: 'two-column',
        price: { amount: 24.99, currency: 'USD' },
        features: ['Skill Charts', 'VIP Only', 'Tech Focused', 'ATS++'],
        tags: ['tech', 'pro', 'charts']
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to database');

        // Clear existing data
        await Template.deleteMany({});
        console.log('🗑️  Cleared existing templates');

        // Insert templates
        await Template.insertMany(templates);
        console.log(`✅ Seeded ${templates.length} templates`);

        // Create admin user
        const adminUser = await User.findOne({ email: 'admin@resumebuilder.com' });
        if (!adminUser) {
            await User.create({
                name: 'Admin User',
                email: 'admin@resumebuilder.com',
                password: 'admin123',
                isVerified: true,
                subscription: {
                    plan: 'vip',
                    status: 'active'
                }
            });
            console.log('✅ Created admin user');
        }

        console.log('🎉 Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();