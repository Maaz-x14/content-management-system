# Morphe Labs Custom CMS - Backend API

## Overview
Production-ready Content Management System backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Features
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Super Admin, Editor, Viewer)
- ✅ Three core modules: Blog, Services/Portfolio, Careers
- ✅ File upload and media management
- ✅ Email notifications
- ✅ Comprehensive error handling
- ✅ Request validation
- ✅ Rate limiting
- ✅ Logging with Winston
- ✅ Database migrations and seeders

## Tech Stack
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.18+
- **Language:** TypeScript 5.0+
- **Database:** PostgreSQL 15+
- **ORM:** Sequelize 6.35+
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt (12 rounds)
- **Validation:** express-validator
- **File Upload:** Multer + Sharp
- **Email:** Nodemailer
- **Logging:** Winston
- **Testing:** Jest + Supertest

## Prerequisites
- Node.js 20 LTS or higher
- PostgreSQL 15 or higher
- npm or yarn

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.development`:
```bash
cp .env.example .env.development
```

Edit `.env.development` and configure:
- Database connection (DATABASE_URL)
- JWT secrets (JWT_SECRET, REFRESH_TOKEN_SECRET)
- SMTP settings for email
- Other configuration as needed

### 3. Set Up Database
Create PostgreSQL database:
```bash
createdb morphe_cms_dev
```

Run migrations:
```bash
npm run db:migrate
```

Seed initial data (roles, admin user, categories):
```bash
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Project Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── migrations/       # Database migrations
│   ├── seeders/          # Database seeders
│   ├── tests/            # Test files
│   └── server.ts         # Application entry point
├── uploads/              # File storage (development)
├── logs/                 # Application logs
└── package.json
```

## API Documentation

### Base URL
- Development: `http://localhost:5000/api/v1`
- Production: `https://api.morphelabs.com/api/v1`

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Get current user

### Blog Endpoints
- `GET /api/v1/blog/posts` - List all posts (admin)
- `GET /api/v1/blog/posts/:id` - Get single post
- `POST /api/v1/blog/posts` - Create post
- `PATCH /api/v1/blog/posts/:id` - Update post
- `DELETE /api/v1/blog/posts/:id` - Delete post
- `GET /api/v1/blog/categories` - List categories
- `POST /api/v1/blog/categories` - Create category
- `GET /api/v1/blog/tags` - List tags

### Services Endpoints
- `GET /api/v1/services` - List all services
- `GET /api/v1/services/:id` - Get single service
- `POST /api/v1/services` - Create service
- `PATCH /api/v1/services/:id` - Update service
- `DELETE /api/v1/services/:id` - Delete service

### Careers Endpoints
- `GET /api/v1/careers/jobs` - List all jobs
- `GET /api/v1/careers/jobs/:id` - Get single job
- `POST /api/v1/careers/jobs` - Create job
- `PATCH /api/v1/careers/jobs/:id` - Update job
- `DELETE /api/v1/careers/jobs/:id` - Delete job
- `GET /api/v1/careers/jobs/:jobId/applications` - List applications
- `GET /api/v1/careers/applications/:id` - Get application details

### User Management Endpoints (Super Admin Only)
- `GET /api/v1/users` - List all users
- `GET /api/v1/users/:id` - Get single user
- `POST /api/v1/users` - Create user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Deactivate user

### Media Endpoints
- `POST /api/v1/media/upload` - Upload file
- `GET /api/v1/media` - List files
- `GET /api/v1/media/:id` - Get file details
- `PATCH /api/v1/media/:id` - Update file metadata
- `DELETE /api/v1/media/:id` - Delete file

### Public Endpoints (No Authentication Required)
- `GET /api/v1/public/blog/posts` - List published posts
- `GET /api/v1/public/blog/posts/:slug` - Get post by slug
- `GET /api/v1/public/services` - List published services
- `GET /api/v1/public/services/:slug` - Get service by slug
- `GET /api/v1/public/careers/jobs` - List active jobs
- `GET /api/v1/public/careers/jobs/:slug` - Get job by slug
- `POST /api/v1/public/careers/jobs/:jobId/apply` - Submit application

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed` - Run database seeders
- `npm run db:reset` - Reset database (undo all, migrate, seed)

## Default Credentials
After running seeders, you can log in with:
- **Email:** admin@morphelabs.com
- **Password:** Admin@123456

**⚠️ IMPORTANT:** Change this password immediately in production!

## Security Features
- Password hashing with bcrypt (12 rounds)
- JWT-based authentication
- Rate limiting on login endpoint (5 attempts per 15 min)
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection

## Testing
Run unit and integration tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Deployment

### Environment Variables for Production
Ensure these are set in production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database URL
- `JWT_SECRET` - Strong secret (min 32 characters)
- `REFRESH_TOKEN_SECRET` - Strong secret (min 32 characters)
- `CORS_ORIGIN` - Frontend domain
- `SMTP_*` - Production email service credentials

### Build and Run
```bash
npm run build
npm start
```

## License
MIT

## Support
For issues and questions, please contact the development team.
