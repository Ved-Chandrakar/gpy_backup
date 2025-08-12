const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create mothers photos directory if it doesn't exist
const motherPhotosDir = path.join(__dirname, '../uploads/mothers');
if (!fs.existsSync(motherPhotosDir)) {
  fs.mkdirSync(motherPhotosDir, { recursive: true });
}

// Storage configuration for mother photos
const motherPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, motherPhotosDir);
  },
  filename: (req, file, cb) => {
    // Generate filename: motherphotos_timestamp_photoType_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const photoType = file.fieldname; // certificate or plant_distribution
    const filename = `motherphotos_${uniqueSuffix}_${photoType}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const motherPhotoFilter = (req, file, cb) => {
  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error('केवल छवि फाइलें (JPG, PNG, GIF, WEBP) की अनुमति है!'), false);
  }
};

// Multer configuration for mother photos
const motherPhotoUpload = multer({
  storage: motherPhotoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for photos
    files: 10 // Maximum 10 photos total
  },
  fileFilter: motherPhotoFilter
});

module.exports = motherPhotoUpload;
