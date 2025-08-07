const crypto = require('crypto');
const { User } = require('../models');

// In-memory storage for refresh tokens
// In production, use Redis or database table
const refreshTokens = new Map();

// Generate a secure refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Store refresh token for user
const storeRefreshToken = (userId, refreshToken, expiresAt) => {
  refreshTokens.set(refreshToken, {
    userId,
    expiresAt,
    createdAt: new Date()
  });
};

// Validate and get user from refresh token
const validateRefreshToken = async (refreshToken) => {
  const tokenData = refreshTokens.get(refreshToken);
  
  if (!tokenData) {
    return null; // Token not found
  }
  
  if (new Date() > tokenData.expiresAt) {
    // Token expired, remove it
    refreshTokens.delete(refreshToken);
    return null;
  }
  
  // Get user data
  const user = await User.findByPk(tokenData.userId, {
    attributes: { exclude: ['password'] }
  });
  
  if (!user || !user.is_active) {
    // User not found or inactive, remove token
    refreshTokens.delete(refreshToken);
    return null;
  }
  
  return user;
};

// Remove refresh token (for logout or when used)
const removeRefreshToken = (refreshToken) => {
  return refreshTokens.delete(refreshToken);
};

// Remove all refresh tokens for a user (for logout all devices)
const removeAllUserRefreshTokens = (userId) => {
  for (const [token, data] of refreshTokens.entries()) {
    if (data.userId === userId) {
      refreshTokens.delete(token);
    }
  }
};

// Cleanup expired refresh tokens
const cleanupExpiredRefreshTokens = () => {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [token, data] of refreshTokens.entries()) {
    if (now > data.expiresAt) {
      refreshTokens.delete(token);
      cleanedCount++;
    }
  }
  
  return cleanedCount;
};

// Get refresh token stats
const getRefreshTokenStats = () => {
  return {
    totalTokens: refreshTokens.size,
    tokens: Array.from(refreshTokens.entries()).map(([token, data]) => ({
      token: token.substring(0, 16) + '...',
      userId: data.userId,
      expiresAt: data.expiresAt,
      createdAt: data.createdAt
    }))
  };
};

module.exports = {
  generateRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  removeRefreshToken,
  removeAllUserRefreshTokens,
  cleanupExpiredRefreshTokens,
  getRefreshTokenStats
};
