/**
 * URL Helper Utilities
 * Functions for generating full URLs for files and resources
 */

/**
 * Generate full URL for uploaded files
 * @param {string} filePath - Relative file path (e.g., "uploads/plant-photos/photo.jpg" or "plant-photos/photo.jpg")
 * @param {Object} req - Express request object (optional, for dynamic base URL)
 * @returns {string} - Full URL (e.g., "http://localhost:3000/uploads/plant-photos/photo.jpg")
 */
const getFullFileUrl = (filePath, req = null) => {
  if (!filePath) return null;
  
  // Remove leading slash if present and normalize path separators
  let cleanPath = filePath.replace(/\\/g, '/');
  cleanPath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  
  // Get base URL from environment or request
  let baseUrl;
  
  if (req) {
    // Dynamic base URL from request
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    baseUrl = `${protocol}://${host}`;
  } else {
    // Static base URL from environment
    baseUrl = process.env.BASE_URL || process.env.SERVER_URL || 'http://localhost:3000';
  }
  
  // Ensure path starts with uploads/
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }
  
  // Construct full URL
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Generate full URL for photo specifically
 * @param {string} photoUrl - Photo URL from database
 * @param {Object} req - Express request object (optional)
 * @returns {string} - Full photo URL
 */
const getFullPhotoUrl = (photoUrl, req = null) => {
  if (!photoUrl) return null;
  
  // Handle different photo URL formats and normalize path separators
  let cleanPhotoUrl = photoUrl.replace(/\\/g, '/');
  
  // Remove leading slash if present
  cleanPhotoUrl = cleanPhotoUrl.startsWith('/') ? cleanPhotoUrl.substring(1) : cleanPhotoUrl;
  
  // If it's already a full URL, return as is
  if (cleanPhotoUrl.startsWith('http://') || cleanPhotoUrl.startsWith('https://')) {
    return cleanPhotoUrl;
  }
  
  // If it already includes the full path, use getFullFileUrl directly
  if (cleanPhotoUrl.includes('uploads/plant-photos/')) {
    return getFullFileUrl(cleanPhotoUrl, req);
  }
  
  // If it starts with 'uploads/', assume it's a full upload path
  if (cleanPhotoUrl.startsWith('uploads/')) {
    return getFullFileUrl(cleanPhotoUrl, req);
  }
  
  // If it starts with 'plant-photos/', add the uploads prefix
  if (cleanPhotoUrl.startsWith('plant-photos/')) {
    return getFullFileUrl(`uploads/${cleanPhotoUrl}`, req);
  }
  
  // Otherwise, assume it's just a filename and add the full path
  return getFullFileUrl(`uploads/plant-photos/${cleanPhotoUrl}`, req);
};

/**
 * Process photo object to include full URL
 * @param {Object} photo - Photo object from database
 * @param {Object} req - Express request object (optional)
 * @returns {Object} - Photo object with full_url field
 */
const processPhotoObject = (photo, req = null) => {
  if (!photo) return null;
  
  const photoObj = photo.toJSON ? photo.toJSON() : photo;
  
  return {
    ...photoObj,
    photo_url: getFullPhotoUrl(photoObj.photo_url, req),
    full_url: getFullPhotoUrl(photoObj.photo_url, req) // For backward compatibility
  };
};

module.exports = {
  getFullFileUrl,
  getFullPhotoUrl,
  processPhotoObject
};
