const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create plant images directory if it doesn't exist
const plantImagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(plantImagesDir)) {
  fs.mkdirSync(plantImagesDir, { recursive: true });
}

// Storage configuration for plant images
const plantImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, plantImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate filename: plant_timestamp_originalname
    const uniqueSuffix = Date.now();
    const extension = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, extension);
    const filename = `plant_${uniqueSuffix}_${originalName}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('केवल छवि फाइलें (JPG, PNG, GIF, WEBP) की अनुमति है!'), false);
  }
};

// Multer configuration for plant images
const plantImageUpload = multer({
  storage: plantImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one image per plant
  },
  fileFilter: imageFilter
});

module.exports = plantImageUpload;
