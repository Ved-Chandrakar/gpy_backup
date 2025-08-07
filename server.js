const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeFirebase } = require('./config/firebase');
const routes = require('./routes');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');
const { initializeCronJobs } = require('./scripts/cronJobs');
const { cleanupBlacklist } = require('./utils/tokenBlacklist');
const { cleanupExpiredRefreshTokens } = require('./utils/refreshTokenManager');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers if needed
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://greenpaalna.gov.in', 'https://www.greenpaalna.gov.in']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/v1', limiter);

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware (must be before session)
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'green-paalna-session-secret',
  resave: false,
  saveUninitialized: true, // Allow uninitialized sessions for flash messages
  cookie: {
    secure: false, // Force false for localhost testing
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax'
  },
  name: 'connect.sid' // Explicitly set session name
}));

// Flash messages
app.use(flash());

// Global variables for templates
app.use((req, res, next) => {
  // Flash messages
  const successMessages = req.flash('success');
  const errorMessages = req.flash('error');
  const successMsgMessages = req.flash('success_msg');
  const errorMsgMessages = req.flash('error_msg');
  
  // Combine all success messages
  const allSuccessMessages = [...successMessages, ...successMsgMessages];
  const allErrorMessages = [...errorMessages, ...errorMsgMessages];
  
  // Create flash object for templates
  res.locals.flash = {
    success: allSuccessMessages.length > 0 ? allSuccessMessages[0] : null,
    error: allErrorMessages.length > 0 ? allErrorMessages[0] : null
  };
  
  // Keep individual ones for backward compatibility
  res.locals.success_msg = successMsgMessages;
  res.locals.error_msg = errorMsgMessages;
  res.locals.error = errorMessages;
  res.locals.success = successMessages;
  res.locals.user = req.user || null;
  next();
});

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Green Paalna Yojna API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      mothers: '/api/v1/mothers',
      plants: '/api/v1/plants',
      photos: '/api/v1/plant-photos',
      dashboard: '/api/v1/dashboard',
      locations: '/api/v1/locations'
    }
  });
});

// API routes
app.use('/api/v1', routes);

// Admin routes
app.use('/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize Firebase
    try {
      initializeFirebase();
      console.log('🔥 Firebase initialized successfully');
    } catch (firebaseError) {
      console.warn('⚠️ Firebase initialization skipped:', firebaseError.message);
      console.log('💡 To enable push notifications, configure Firebase environment variables');
    }
    
    // Initialize cron jobs
    if (process.env.NODE_ENV === 'production') {
      initializeCronJobs();
    }
    
    // Start token blacklist cleanup (runs every hour)
    setInterval(() => {
      cleanupBlacklist();
      const refreshTokensCleanedCount = cleanupExpiredRefreshTokens();
      console.log(`🧹 Token cleanup completed. Refresh tokens cleaned: ${refreshTokensCleanedCount}`);
    }, 60 * 60 * 1000); // 1 hour
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`
🚀 Green Paalna Yojna API Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://localhost:${PORT}
 Health Check: http://localhost:${PORT}/api/v1/health
🌱 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
