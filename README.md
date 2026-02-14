# Morphe Labs Custom CMS

> A production-ready Content Management System built with Node.js, Express, TypeScript, React, and PostgreSQL.

## 🎯 Project Overview

The Morphe Labs CMS is a self-hosted content management system designed to empower non-technical staff to manage website content independently. The system eliminates developer bottlenecks while maintaining brand consistency and enabling efficient content delivery.

### Core Features

- **Blog/Article Management** - Create, edit, publish, and delete blog posts with status tracking (Published/Draft).
- **Services/Portfolio Management** - Manage service offerings and portfolio items.
- **Careers/Job Listings** - Post job openings, manage applications, and track candidate status.
- **Media Library** - Upload and manage images and files centrally.
- **User Management** - Role-based access control (Super Admin, Editor, Viewer) with secure authentication.
- **Dashboard** - Real-time statistics and recent activity feed.
- **Authentication** - Secure JWT-based auth with refresh token rotation.
- **RESTful API** - Fully documented API for frontend integration.

## 📁 Project Structure

```
CMS/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Database & App Config
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, Validation, Error handling
│   │   ├── models/            # Sequelize Models
│   │   ├── routes/            # API Routes
│   │   ├── services/          # Business Logic
│   │   ├── utils/             # Helpers (Logger, APIError)
│   │   └── types/             # Check types
│   └── ...
│
├── frontend/                   # React Admin Panel
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth & Theme Context
│   │   ├── pages/             # Page Views (Dashboard, Users, Posts, etc.)
│   │   ├── services/          # API Services
│   │   └── types/             # TypeScript Definitions
│   └── ...
│
├── docs/                       # Project Documentation
│   ├── PRD.md                 # Product Requirements
│   ├── API_spec.md            # API Documentation
│   └── ...
│
└── README.md                   # Project Overview
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

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env.development
   # Edit .env.development with your database credentials
   
   # Database Setup
   createdb morphe_cms_dev
   npm run db:migrate
   npm run db:seed
   
   # Start Server
   npm run dev
   ```
   The API will be available at `http://localhost:5001/api/v1`

3. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Start Client
   npm run dev
   ```
   The Admin Panel will be available at `http://localhost:5173`

### Default Credentials

After running seeders:
- **Email:** admin@morphelabs.com
- **Password:** Admin@123456

⚠️ **Change this password immediately in production!**

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4.18+
- **Language:** TypeScript 5.0+
- **Database:** PostgreSQL 15+
- **ORM:** Sequelize 6.35+
- **Auth:** JWT, bcrypt
- **Validation:** Zod, express-validator
- **Logging:** Winston + Morgan
- **Docs:** Swagger/OpenAPI

### Frontend
- **Framework:** React 18.2+
- **Build Tool:** Vite 5.0+
- **Language:** TypeScript 5.0+
- **Styling:** Tailwind CSS (v4)
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router 6.20+
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## 📝 Scripts

### Backend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server (dist)
npm test                 # Run tests
npm run lint             # Run ESLint
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🔐 Security Features

- **Authentication**: JWT access & refresh tokens.
- **Authorization**: Role-based access control (RBAC).
- **Data Protection**: Password hashing (bcrypt), Input validation (Zod).
- **Network**: CORS configuration, Helmet.js headers, Rate limiting.

## 📊 Project Status

- **Current Phase:** Minimum Viable Product (MVP) Complete.
- **Frontend Status:** Core pages implemented (Dashboard, Users, Posts, Services, Jobs, Media).
- **Backend Status:** Core APIs fully functional and documented.
- **Next Steps:** See [future.md](future.md) for the roadmap.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for Morphe Labs**
