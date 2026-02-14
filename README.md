# Morphe Labs Custom CMS

> A production-ready Content Management System built with Node.js, Express, TypeScript, React, and PostgreSQL.

## 🎯 Project Overview

The Morphe Labs CMS is a self-hosted content management system designed to empower non-technical staff to manage website content independently. The system eliminates developer bottlenecks while maintaining brand consistency and enabling efficient content delivery.

### Core Features

- **Blog/Article Management** - Rich text editor, categories, tags, SEO, publishing workflow
- **Services/Portfolio Management** - Project showcase, image galleries, case studies
- **Careers/Job Listings** - Job posting, application tracking, resume uploads
- **Media Library** - File upload, image optimization, centralized asset management
- **User Management** - Role-based access control (Super Admin, Editor, Viewer)
- **Authentication** - JWT-based auth with refresh tokens
- **Email Notifications** - Password reset, job applications
- **RESTful API** - Public and admin endpoints

## 📁 Project Structure

```
CMS/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   ├── migrations/        # Database migrations
│   │   ├── seeders/           # Seed data
│   │   └── tests/             # Test files
│   ├── uploads/               # File storage
│   ├── logs/                  # Application logs
│   └── package.json
│
├── frontend/                   # React Admin Panel (to be built)
│   └── (React + TypeScript + Vite)
│
├── docs/                       # Documentation
│   ├── PRD.md                 # Product requirements
│   ├── API_spec.md            # API documentation
│   ├── DB_schema.md           # Database schema
│   ├── Architecture.md        # System architecture
│   ├── Implementation_plan.md # Implementation phases
│   └── Coding_guidelines.md   # Code standards
│
└── README.md                   
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- PostgreSQL 15 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Maaz-x14/content-management-system.git
   cd CMS
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your database credentials
   ```

4. **Set up the database**
   ```bash
   createdb morphe_cms_dev
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### Default Credentials

After running seeders:
- **Email:** admin@morphelabs.com
- **Password:** Admin@123456

⚠️ **Change this password immediately in production!**

## 📚 Documentation

### Essential Reading

1. **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Setup completion status and next steps
2. **[DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)** - Step-by-step development guide
3. **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Current implementation status
4. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

### Technical Specifications

1. **[PRD.md](PRD.md)** - Product Requirements Document
2. **[API_spec.md](API_spec.md)** - Complete API endpoint documentation
3. **[DB_schema.md](DB_schema.md)** - Database schema and table definitions
4. **[Architecture.md](Architecture.md)** - System architecture and data flow
5. **[Implementation_plan.md](Implementation_plan.md)** - 16-week implementation plan
6. **[Coding_guidelines.md](Coding_guidelines.md)** - Code standards and examples

## 🛠️ Technology Stack

### Backend
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

### Frontend (To Be Built)
- **Framework:** React 18.2+
- **Language:** TypeScript 5.0+
- **Build Tool:** Vite 5.0+
- **UI Library:** Ant Design or Material-UI
- **Routing:** React Router 6.20+
- **State Management:** React Query
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **Rich Text Editor:** TipTap

## 🎯 Next Steps

1. **Set up PostgreSQL database**
   ```bash
   createdb morphe_cms_dev
   ```

2. **Update environment variables**
   - Edit `backend/.env.development`
   - Set your database credentials

3. **Create database models**
   - Start with `Role.model.ts`
   - Follow the order in `DEVELOPMENT_ROADMAP.md`

4. **Create migrations and seeders**
   - Use Sequelize CLI
   - Refer to `DB_schema.md` for table definitions

5. **Build authentication system**
   - Middleware, services, controllers, routes
   - Test with Postman

6. **Build core modules**
   - Blog, Services, Careers
   - Follow `DEVELOPMENT_ROADMAP.md`

## 📝 Scripts

### Backend Development
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run tests
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Database
```bash
npm run db:migrate       # Run migrations
npm run db:migrate:undo  # Undo last migration
npm run db:seed          # Run seeders
npm run db:reset         # Reset database
```

## 🔐 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based authentication with refresh tokens
- Rate limiting (5 login attempts per 15 min)
- CORS configuration
- Helmet.js security headers
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- File upload validation

## 📊 Project Timeline

- **Total Duration:** 16 weeks
- **Team Size:** 2-3 developers
- **Current Status:** Week 1 - Foundation Complete
- **Next Phase:** Week 2-3 - Database Models & Authentication

## 🤝 Contributing

1. Follow the coding guidelines in `Coding_guidelines.md`
2. Write tests for new features
3. Use meaningful commit messages
4. Create pull requests for review

## 📄 License

MIT License - See LICENSE file for details

## 📞 Support

For questions and issues:
- Refer to the documentation in the `docs/` folder
- Check `DEVELOPMENT_ROADMAP.md` for step-by-step guidance
- Review `IMPLEMENTATION_STATUS.md` for current status

---

**Built with ❤️ by Maaz Ahmad**

Ready to build a production-ready CMS! 🚀
