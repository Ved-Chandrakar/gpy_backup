const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Set up basic express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database models
const { Child, User, District, Block, Village, PlantAssignment, Plant, PlantPhoto, PlantTrackingSchedule } = require('../models');
const { getTrackingStats, getCompletionPercentage } = require('../utils/plantTrackingUtils');

// Test function to call the detail API function directly
const testDetailAPI = async () => {
  try {
    console.log('🔍 Testing detail API function directly...');
    
    // Create mock req and res objects
    const req = {
      params: { assignmentId: '22' },
      user: { mobile: '9876543210', userid: '9876543210' }
    };
    
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        console.log('✅ Response Status:', this.statusCode);
        console.log('✅ Response Data:', JSON.stringify(data, null, 2));
      }
    };

    // Import and call the controller function
    const { getMotherPlantTrackingDetails } = require('../controllers/motherController');
    await getMotherPlantTrackingDetails(req, res);
    
  } catch (error) {
    console.error('❌ Test error:', error);
    console.error('❌ Error stack:', error.stack);
  }
  
  process.exit(0);
};

testDetailAPI();
