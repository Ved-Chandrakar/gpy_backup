# Green Paalna Yojna Backend

A comprehensive backend system for tracking plant distribution to new mothers in Chhattisgarh, India.

## 🎯 Project Overview

Each woman who gives birth receives 5 plants. For 3 months, she (or mitanin/AWW) uploads plant photos weekly (1st month) and every 15 days (next 2 months). GPS tagging and plant progress tracking are required.

## 👥 User Roles

1. **State Nodal Officer** - View reports for entire state
2. **Collector (District)** - View district-wise reports  
3. **Hospital** - Register mother/child, assign plants
4. **Mitanin / AWW (Mobile App)** - Upload photos, track plant growth
5. **Mother (Mobile App)** - Upload photos if she has a mobile

## 🛠️ Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JWT Authentication
- Multer for file uploads

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Update database credentials in `.env`
5. Run database migrations and seed data:
   ```bash
   npm run seed
   ```
6. Start the server:
   ```bash
   npm run dev
   ```

##  Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

```
├── config/          # Database and app configuration
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── scripts/        # Utility scripts
├── uploads/        # File uploads directory
├── utils/          # Helper functions
└── server.js       # Main application file
```

## 🌱 Environment Variables

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=green_paalna_yojna
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
```

## 📊 Database Schema

- `users` - User accounts (hospitals, mitanins, mothers, admins)
- `roles` - User roles and permissions
- `children` - Child registration data
- `plants` - Plant species information
- `plant_assignments` - Plant assignments to mothers
- `plant_photos` - Photo uploads with GPS data
- `replacement_requests` - Plant replacement requests
- `districts`, `blocks`, `villages` - Location hierarchy

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Hospital Management
- `POST /api/mothers` - Register new mother and child
- `POST /api/assign-plants` - Assign plants to mother

### Mobile App (Mitanin/Mother)
- `POST /api/plant-photo` - Upload plant photo with GPS
- `POST /api/request-replacement` - Submit replacement request

### Reports & Dashboard
- `GET /api/dashboard/state` - State-level statistics
- `GET /api/dashboard/district/:id` - District-level statistics
- `GET /api/mothers/:id/progress` - Mother's plant progress

## 📝 License

This project is licensed under the MIT License.
