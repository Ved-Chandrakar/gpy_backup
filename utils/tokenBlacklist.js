// In-memory token blacklist for invalidated tokens
// In production, you should use Redis or a database table for this
const blacklistedTokens = new Set();

// Add a token to the blacklist
const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};

// Check if a token is blacklisted
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

// Clean up expired tokens from blacklist (call this periodically)
const cleanupBlacklist = () => {
  const jwt = require('jsonwebtoken');
  const currentTime = Math.floor(Date.now() / 1000);
  
  for (const token of blacklistedTokens) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp && decoded.exp < currentTime) {
        blacklistedTokens.delete(token);
      }
    } catch (error) {
      // Invalid token format, remove it
      blacklistedTokens.delete(token);
    }
  }
};

// Get blacklist size (for monitoring)
const getBlacklistSize = () => {
  return blacklistedTokens.size;
};

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist,
  getBlacklistSize
};
