

// backend/seeds/templates.seed.js
const Template = require('../models/Template');
 const TEMPLATES =require('../../resume-maker-frontend/src/data/templates.json');

const seedTemplates = async () => {
  try {
    console.log('🗑️  Deleting existing templates...');
    await Template.deleteMany({});

    console.log('💾 Inserting new templates...');
    const result = await Template.insertMany(
      TEMPLATES.map(t => ({
        id: t.id,                 // ✅ string ID
        name: t.name,
        category: t.category,
        thumbnail: t.thumbnail,
        description: t.description,
        colors: t.colors,
        layout: t.layout,
        features: t.features || [],
        price: t.price || 0       // ✅ number
      }))
    );

    console.log(`✅ Successfully seeded ${result.length} templates!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding templates:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/database');
  connectDB().then(() => seedTemplates());
}