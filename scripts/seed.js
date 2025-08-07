const { testConnection } = require('../config/database');
const { syncDatabase } = require('../models');
const seedData = require('./seedData');

const initializeDatabase = async () => {
  try {
    console.log('🔄 डेटाबेस प्रारंभ कर रहे हैं...');
    
    // कनेक्शन टेस्ट करें
    await testConnection();
    
    // डेटाबेस सिंक करें (टेबल बनाएं)
    await syncDatabase();
    
    // बीज डेटा भरें
    await seedData();
    
    console.log('✅ डेटाबेस सफलतापूर्वक प्रारंभ हो गया!');
    process.exit(0);
  } catch (error) {
    console.error('❌ डेटाबेस प्रारंभीकरण असफल:', error);
    process.exit(1);
  }
};

initializeDatabase();
