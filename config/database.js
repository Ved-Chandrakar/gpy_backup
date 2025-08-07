const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'green_paalna_yojna',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+05:30', // IST timezone
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// डेटाबेस कनेक्शन टेस्ट करें
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection
};
