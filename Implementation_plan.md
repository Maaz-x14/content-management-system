# Implementation Plan
## Morphe Labs Custom CMS

**Version:** 1.0  
**Project Duration:** 16 Weeks  
**Team Size:** 2-3 Developers  
**Start Date:** March 1, 2026

---

## 1. Technology Stack

### 1.1 Backend Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express.js | 4.18+ |
| Language | TypeScript | 5.0+ |
| Database | PostgreSQL | 15+ |
| ORM | Sequelize | 6.35+ |
| Authentication | jsonwebtoken | 9.0+ |
| Password Hashing | bcrypt | 5.1+ |
| Validation | express-validator | 7.0+ |
| File Upload | Multer | 1.4+ |
| Image Processing | Sharp | 0.33+ |
| Email | Nodemailer | 6.9+ |
| Logging | Winston | 3.11+ |
| Testing | Jest | 29.7+ |
| API Testing | Supertest | 6.3+ |

**Installation Command:**
```bash
npm install express typescript sequelize pg bcrypt jsonwebtoken \
  multer sharp nodemailer winston cors helmet express-validator \
  dotenv morgan cookie-parser express-rate-limit

npm install --save-dev @types/node @types/express @types/bcrypt \
  @types/jsonwebtoken jest ts-jest supertest @types/supertest \
  eslint prettier
```

---

### 1.2 Frontend Stack (Admin Panel)

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.2+ |
| Language | TypeScript | 5.0+ |
| Build Tool | Vite | 5.0+ |
| Routing | React Router | 6.20+ |
| State Management | React Query | 5.0+ |
| HTTP Client | Axios | 1.6+ |
| UI Framework | Tailwind CSS | 3.4+ |
| Component Library | shadcn/ui | Latest |
| Rich Text Editor | TipTap | 2.1+ |
| Form Handling | React Hook Form | 7.49+ |
| Date Picker | react-datepicker | 4.24+ |
| Testing | React Testing Library | 14.1+ |

**Installation Command:**
```bash
npm create vite@latest admin-panel -- --template react-ts
cd admin-panel
npm install react-router-dom @tanstack/react-query axios \
  tailwindcss @tiptap/react @tiptap/starter-kit react-hook-form \
  react-datepicker lucide-react

npm install --save-dev @testing-library/react @testing-library/jest-dom
```

---

### 1.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Repository hosting + CI/CD |
| VS Code | Code editor |
| Postman | API testing |
| DBeaver / pgAdmin | Database management |
| ESLint | Code linting |
| Prettier | Code formatting |
| Docker | Local development (PostgreSQL) |

---

## 2. Project Structure

### 2.1 Backend Folder Structure

```
morphe-cms-backend/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── database.ts           # Database connection config
│   │   ├── auth.ts               # JWT and session config
│   │   ├── upload.ts             # File upload settings
│   │   └── email.ts              # Email service config
│   │
│   ├── controllers/               # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── blog.controller.ts
│   │   ├── category.controller.ts
│   │   ├── tag.controller.ts
│   │   ├── service.controller.ts
│   │   ├── career.controller.ts
│   │   ├── user.controller.ts
│   │   └── media.controller.ts
│   │
│   ├── middleware/                # Custom middleware
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── permission.middleware.ts  # Role-based access
│   │   ├── validate.middleware.ts    # Request validation
│   │   ├── upload.middleware.ts      # File upload handling
│   │   ├── rateLimit.middleware.ts   # Rate limiting
│   │   └── error.middleware.ts       # Global error handler
│   │
│   ├── models/                    # Database models (Sequelize)
│   │   ├── index.ts              # Model initialization and associations
│   │   ├── User.model.ts
│   │   ├── Role.model.ts
│   │   ├── BlogPost.model.ts
│   │   ├── Category.model.ts
│   │   ├── Tag.model.ts
│   │   ├── PostTag.model.ts
│   │   ├── Service.model.ts
│   │   ├── ServiceImage.model.ts
│   │   ├── JobListing.model.ts
│   │   ├── JobApplication.model.ts
│   │   └── MediaFile.model.ts
│   │
│   ├── routes/                    # Route definitions
│   │   ├── index.ts              # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── blog.routes.ts
│   │   ├── service.routes.ts
│   │   ├── career.routes.ts
│   │   ├── user.routes.ts
│   │   ├── media.routes.ts
│   │   └── public.routes.ts
│   │
│   ├── services/                  # Business logic
│   │   ├── auth.service.ts
│   │   ├── blog.service.ts
│   │   ├── service.service.ts
│   │   ├── career.service.ts
│   │   ├── user.service.ts
│   │   ├── media.service.ts
│   │   └── email.service.ts
│   │
│   ├── utils/                     # Utility functions
│   │   ├── encryption.ts         # Password hashing, JWT
│   │   ├── validation.ts         # Custom validators
│   │   ├── slugify.ts           # URL slug generation
│   │   ├── fileUpload.ts        # File handling helpers
│   │   └── logger.ts            # Winston logger setup
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── express.d.ts          # Express type extensions
│   │   ├── models.d.ts           # Model interfaces
│   │   └── api.d.ts              # API request/response types
│   │
│   ├── migrations/                # Database migrations (Sequelize CLI)
│   │   ├── 001-create-users.js
│   │   ├── 002-create-roles.js
│   │   ├── 003-create-blog-posts.js
│   │   └── ...
│   │
│   ├── seeders/                   # Database seed data
│   │   ├── 001-roles.js
│   │   ├── 002-admin-user.js
│   │   └── 003-categories.js
│   │
│   ├── tests/                     # Test files
│   │   ├── unit/                 # Unit tests
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── integration/          # Integration tests
│   │   │   └── api/
│   │   └── setup.ts              # Test configuration
│   │
│   └── server.ts                  # Application entry point
│
├── uploads/                       # Local file storage (dev only)
│   ├── images/
│   ├── documents/
│   └── temp/
│
├── .env.example                   # Environment variables template
├── .env.development               # Development environment config
├── .env.production                # Production environment config
├── .gitignore
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json
├── jest.config.js                # Jest configuration
└── README.md
```

---

### 2.2 Frontend Folder Structure

```
morphe-cms-frontend/
├── public/
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── assets/                    # Static assets
│   │   ├── images/
│   │   └── styles/
│   │       └── globals.css
│   │
│   ├── components/                # Reusable components
│   │   ├── common/               # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Dropdown.tsx
│   │   │
│   │   ├── forms/                # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── BlogPostForm.tsx
│   │   │   ├── ServiceForm.tsx
│   │   │   └── JobForm.tsx
│   │   │
│   │   ├── layouts/              # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   └── modules/              # Module-specific components
│   │       ├── blog/
│   │       │   ├── PostList.tsx
│   │       │   ├── PostEditor.tsx
│   │       │   └── CategoryManager.tsx
│   │       ├── services/
│   │       │   ├── ServiceList.tsx
│   │       │   └── ServiceEditor.tsx
│   │       ├── careers/
│   │       │   ├── JobList.tsx
│   │       │   ├── JobEditor.tsx
│   │       │   └── ApplicationViewer.tsx
│   │       └── media/
│   │           ├── MediaLibrary.tsx
│   │           └── ImageUploader.tsx
│   │
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useBlogPosts.ts
│   │   ├── useServices.ts
│   │   ├── useJobs.ts
│   │   ├── useMediaFiles.ts
│   │   └── useDebounce.ts
│   │
│   ├── lib/                       # Third-party library configs
│   │   ├── axios.ts              # Axios instance with interceptors
│   │   ├── queryClient.ts        # React Query configuration
│   │   └── tiptap.ts             # TipTap editor setup
│   │
│   ├── pages/                     # Route components
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── blog/
│   │   │   ├── BlogList.tsx
│   │   │   ├── BlogCreate.tsx
│   │   │   └── BlogEdit.tsx
│   │   ├── services/
│   │   │   ├── ServiceList.tsx
│   │   │   ├── ServiceCreate.tsx
│   │   │   └── ServiceEdit.tsx
│   │   ├── careers/
│   │   │   ├── JobList.tsx
│   │   │   ├── JobCreate.tsx
│   │   │   ├── JobEdit.tsx
│   │   │   └── Applications.tsx
│   │   ├── users/
│   │   │   ├── UserList.tsx
│   │   │   └── UserCreate.tsx
│   │   └── media/
│   │       └── MediaLibrary.tsx
│   │
│   ├── services/                  # API service functions
│   │   ├── api.ts                # Base API client
│   │   ├── auth.service.ts
│   │   ├── blog.service.ts
│   │   ├── service.service.ts
│   │   ├── career.service.ts
│   │   ├── user.service.ts
│   │   └── media.service.ts
│   │
│   ├── types/                     # TypeScript interfaces
│   │   ├── user.types.ts
│   │   ├── blog.types.ts
│   │   ├── service.types.ts
│   │   ├── career.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/                     # Utility functions
│   │   ├── formatDate.ts
│   │   ├── truncateText.ts
│   │   └── validators.ts
│   │
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Application entry
│   └── router.tsx                 # Route configuration
│
├── .env.example
├── .env.development
├── .gitignore
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 3. Environment Configuration

### 3.1 Backend Environment Variables

**File: `.env.development`**
```bash
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/morphe_cms_dev
DB_HOST=localhost
DB_PORT=5432
DB_NAME=morphe_cms_dev
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-development-secret-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword

# Email (SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=noreply@morphelabs.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

**File: `.env.production`**
```bash
NODE_ENV=production
PORT=5000
API_VERSION=v1

DATABASE_URL=postgresql://user:password@db-host:5432/morphe_cms_prod
JWT_SECRET=strong-production-secret-min-32-chars
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=strong-refresh-secret-min-32-chars

CORS_ORIGIN=https://admin.morphelabs.com

# Cloud storage (AWS S3 or DigitalOcean Spaces)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=morphelabs-cms

# Production SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

LOG_LEVEL=info
```

---

### 3.2 Frontend Environment Variables

**File: `.env.development`**
```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_API_TIMEOUT=30000
```

**File: `.env.production`**
```bash
VITE_API_BASE_URL=https://api.morphelabs.com/api/v1
VITE_API_TIMEOUT=30000
```

---

## 4. Development Workflow

### 4.1 Git Branching Strategy

```
main (production)
  └── develop (integration)
      ├── feature/blog-module
      ├── feature/auth-system
      ├── feature/services-module
      └── bugfix/image-upload
```

**Branch Naming Convention:**
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Production hotfixes
- `refactor/description` - Code refactoring

**Workflow:**
1. Create feature branch from `develop`
2. Develop and test locally
3. Create pull request to `develop`
4. Code review and merge
5. After testing, merge `develop` to `main` for deployment

---

### 4.2 Commit Message Convention

Follow Conventional Commits:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build process or auxiliary tool changes

**Examples:**
```
feat(blog): add rich text editor to blog post form
fix(auth): resolve JWT token expiration issue
docs(api): update API endpoint documentation
```

---

### 4.3 Code Review Checklist

Before merging pull requests:
- [ ] Code follows ESLint and Prettier rules
- [ ] All tests pass (unit + integration)
- [ ] New features have tests
- [ ] API endpoints have proper error handling
- [ ] Security best practices followed (no hardcoded secrets)
- [ ] Database migrations tested
- [ ] Documentation updated if needed
- [ ] No console.log statements in production code

---

## 5. Development Phases

### 5.1 Phase 1: Project Setup & Foundation (Weeks 1-2)

**Duration:** 2 weeks  
**Team:** Full team (2-3 developers)

**Deliverables:**
1. Repository setup (Git, GitHub)
2. Backend project initialization
   - Express.js setup with TypeScript
   - Database connection (PostgreSQL)
   - Basic project structure
3. Frontend project initialization
   - Vite + React + TypeScript setup
   - Tailwind CSS configuration
   - Routing setup
4. Development environment configuration
   - Docker Compose for PostgreSQL
   - Environment variables
   - ESLint and Prettier
5. CI/CD pipeline (GitHub Actions)
   - Automated testing
   - Linting checks

**Tasks:**
```
Week 1:
- Initialize backend and frontend projects
- Set up database schema (initial tables)
- Configure TypeScript, ESLint, Prettier
- Create base folder structure
- Set up Docker for local PostgreSQL

Week 2:
- Implement database models (User, Role)
- Create basic Express server with health check endpoint
- Set up React app with routing
- Configure CI/CD pipeline
- Write project README and setup documentation
```

**Testing Criteria:**
- Server starts without errors
- Database connection successful
- Frontend builds and runs
- CI/CD pipeline executes successfully

---

### 5.2 Phase 2: Authentication & User Management (Weeks 3-4)

**Duration:** 2 weeks  
**Team:** Full team

**Deliverables:**
1. Authentication API
   - Login endpoint
   - JWT token generation and validation
   - Password reset flow
   - Refresh token mechanism
2. User management API (Super Admin)
   - CRUD operations for users
   - Role assignment
3. Frontend authentication
   - Login page
   - Authentication context
   - Protected routes
   - Token management
4. User management UI (Super Admin)
   - User list page
   - Create/edit user forms

**Tasks:**
```
Week 3 (Backend):
- Implement User and Role models
- Create authentication middleware
- Build login and logout endpoints
- Password hashing with bcrypt
- JWT token generation
- Role-based access control middleware

Week 3 (Frontend):
- Create login page UI
- Implement authentication context
- Set up protected routes
- Token storage and refresh logic

Week 4 (Backend):
- User CRUD endpoints
- Password reset email flow
- Session management
- Activity logging

Week 4 (Frontend):
- User management UI (Super Admin only)
- User creation form
- User edit form
- Role assignment interface
```

**Testing Criteria:**
- User can log in and receive JWT token
- Token expires after 1 hour
- Protected routes require valid token
- Super Admin can create/edit users
- Password reset email sent successfully

---

### 5.3 Phase 3: Blog Module (Weeks 5-7)

**Duration:** 3 weeks  
**Team:** Full team or split (1-2 on backend, 1 on frontend)

**Deliverables:**
1. Blog post API
   - CRUD operations for posts
   - Category and tag management
   - Publishing workflow (draft/published/scheduled)
   - Search and filtering
2. Blog admin UI
   - Blog post list with filters
   - Rich text editor (TipTap)
   - Category and tag management
   - Image upload integration
3. Public blog API
   - Published posts endpoint
   - Single post by slug
   - Category and tag filtering

**Tasks:**
```
Week 5 (Backend):
- BlogPost, Category, Tag models
- Post CRUD endpoints
- Category and tag endpoints
- Slug generation utility
- Search implementation (full-text)

Week 5-6 (Frontend):
- Blog post list page
- TipTap rich text editor integration
- Blog post creation form
- Image upload for featured images
- Category/tag selection

Week 6-7 (Backend):
- Publishing workflow (draft/scheduled)
- Scheduled publishing logic (cron job or similar)
- SEO metadata fields
- Public API endpoints

Week 7 (Frontend):
- Blog post edit page
- Preview functionality
- Filter and search UI
- Bulk operations (publish/delete)
```

**Testing Criteria:**
- User can create blog post with formatting
- Featured image uploads successfully
- Categories and tags work correctly
- Scheduled posts auto-publish at specified time
- Public API returns only published posts
- Search functionality works

---

### 5.4 Phase 4: Services/Portfolio Module (Weeks 8-9)

**Duration:** 2 weeks  
**Team:** Full team or split

**Deliverables:**
1. Services API
   - CRUD operations for services/projects
   - Image gallery management
   - Case study fields
   - Filtering by category, technology, industry
2. Services admin UI
   - Service/project list
   - Service creation with image upload
   - Case study editor
   - Featured flag toggle
3. Public services API
   - Published services endpoint
   - Filtering support

**Tasks:**
```
Week 8 (Backend):
- Service and ServiceImage models
- Service CRUD endpoints
- Image gallery handling (multiple uploads)
- Filtering and sorting logic

Week 8-9 (Frontend):
- Service list page
- Service creation form
- Multiple image upload interface
- Image reordering (drag-and-drop)
- Case study editor

Week 9 (Backend):
- Public services API
- Featured services logic
- Technology/industry filtering

Week 9 (Frontend):
- Service edit page
- Image management (delete, reorder, set primary)
- Filter UI
```

**Testing Criteria:**
- User can create service with multiple images
- Images can be reordered
- Primary image designation works
- Case study fields save correctly
- Featured services appear first in list
- Public API filters work

---

### 5.5 Phase 5: Careers/Jobs Module (Weeks 10-11)

**Duration:** 2 weeks  
**Team:** Full team or split

**Deliverables:**
1. Job listings API
   - CRUD operations for jobs
   - Application submission endpoint (public)
   - Application management
   - CSV export
2. Jobs admin UI
   - Job list page
   - Job creation form
   - Application viewer
   - Application status management
3. Public jobs API
   - Active jobs listing
   - Single job by slug
   - Application form submission

**Tasks:**
```
Week 10 (Backend):
- JobListing and JobApplication models
- Job CRUD endpoints
- Application submission endpoint
- Resume file upload handling
- Email notification on application

Week 10-11 (Frontend):
- Job list page
- Job creation form (with location, salary fields)
- Application viewer page
- Application status update UI
- CSV export functionality

Week 11 (Backend):
- Public jobs API
- Job filtering (department, location, type)
- Application export to CSV

Week 11 (Frontend):
- Job edit page
- Application filters
- Bulk status update
```

**Testing Criteria:**
- User can create job listing
- Applicants can submit applications via public API
- Resume uploads successfully
- Email notification sent on new application
- Applications can be filtered by status
- CSV export includes all application data

---

### 5.6 Phase 6: Media Library & File Management (Weeks 12-13)

**Duration:** 2 weeks  
**Team:** 1-2 developers

**Deliverables:**
1. Media files API
   - File upload endpoint
   - File metadata management
   - File deletion with usage check
   - Search and filtering
2. Media library UI
   - Grid view of files
   - Upload interface (drag-and-drop)
   - File selection modal
   - Image preview

**Tasks:**
```
Week 12 (Backend):
- MediaFile model
- File upload endpoint with Multer
- Image optimization with Sharp
- File type and size validation
- File deletion with usage tracking

Week 12-13 (Frontend):
- Media library page (grid view)
- Drag-and-drop upload
- File selection modal (for blog/services)
- Image preview
- File search and filters

Week 13 (Backend):
- Cloud storage integration (optional, S3/Spaces)
- CDN URL generation
- File usage tracking

Week 13 (Frontend):
- File metadata editor (alt text)
- Bulk delete
- List view option
```

**Testing Criteria:**
- Files upload successfully
- Images are optimized automatically
- File type validation works
- Cannot delete files in use
- Media library loads quickly
- File selection modal integrates with editors

---

### 5.7 Phase 7: Dashboard & UI Polish (Week 14)

**Duration:** 1 week  
**Team:** Frontend developer(s)

**Deliverables:**
1. Dashboard page
   - Overview cards (total posts, jobs, etc.)
   - Recent activity feed
   - Quick actions
2. UI/UX improvements
   - Loading states
   - Error messages
   - Success notifications (toast)
   - Confirmation dialogs
   - Keyboard shortcuts

**Tasks:**
```
Week 14:
- Build dashboard with stats widgets
- Implement activity feed
- Add loading spinners to all async operations
- Implement toast notifications
- Add confirmation dialogs for destructive actions
- Improve form validation messages
- Keyboard navigation support
- Responsive design fixes
```

**Testing Criteria:**
- Dashboard displays accurate statistics
- All forms show validation errors clearly
- Loading states prevent double-submissions
- Confirmation dialogs work for delete actions
- Responsive design works on tablets

---

### 5.8 Phase 8: Testing, Documentation & Deployment (Weeks 15-16)

**Duration:** 2 weeks  
**Team:** Full team

**Deliverables:**
1. Comprehensive testing
   - Unit tests (backend services)
   - Integration tests (API endpoints)
   - E2E tests (critical user flows)
2. Documentation
   - API documentation (Swagger/Postman)
   - User manual (content editors)
   - Admin guide (super admins)
   - Developer documentation
3. Deployment
   - Production server setup
   - Database migration
   - Environment configuration
   - SSL certificate
   - Monitoring setup

**Tasks:**
```
Week 15:
- Write unit tests for services
- Integration tests for all API endpoints
- E2E tests for login, blog creation, job posting
- Fix identified bugs
- Performance optimization
- Security audit

Week 16:
- Generate API documentation
- Write user manual (with screenshots)
- Deployment guide
- Set up production server
- Deploy backend and frontend
- Database backup setup
- Monitoring and error tracking setup
- Final testing on production
- Training session for users
```

**Testing Criteria:**
- All tests pass (80%+ code coverage)
- No critical bugs
- Production deployment successful
- Monitoring tools configured
- Backup system tested
- Users can access and use the system

---

## 6. Testing Strategy

### 6.1 Backend Testing

**Unit Tests (Jest):**
```typescript
// Example: services/auth.service.test.ts
import { AuthService } from './auth.service';

describe('AuthService', () => {
  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      const result = await AuthService.login('admin@morphelabs.com', 'password');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('should throw error for invalid credentials', async () => {
      await expect(
        AuthService.login('admin@morphelabs.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

**Integration Tests (Supertest):**
```typescript
// Example: routes/blog.routes.test.ts
import request from 'supertest';
import app from '../server';

describe('Blog API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'editor@morphelabs.com', password: 'password' });
    authToken = response.body.data.token;
  });

  describe('POST /api/v1/blog/posts', () => {
    it('should create a new blog post', async () => {
      const response = await request(app)
        .post('/api/v1/blog/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          content: '<p>Test content</p>',
          categoryId: 1,
          status: 'draft'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
```

---

### 6.2 Frontend Testing

**Component Tests (React Testing Library):**
```typescript
// Example: components/forms/BlogPostForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BlogPostForm } from './BlogPostForm';

describe('BlogPostForm', () => {
  it('should render all form fields', () => {
    render(<BlogPostForm />);
    
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeInTheDocument();
  });

  it('should show validation error for empty title', async () => {
    render(<BlogPostForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
    
    expect(await screen.findByText('Title is required')).toBeInTheDocument();
  });
});
```

---

### 6.3 E2E Testing (Playwright - Optional)

```typescript
// Example: e2e/blog-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('create and publish blog post', async ({ page }) => {
  // Login
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'editor@morphelabs.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to blog
  await page.click('text=Blog');
  await page.click('text=Create New Post');
  
  // Fill form
  await page.fill('input[name="title"]', 'E2E Test Post');
  await page.fill('textarea[name="content"]', 'This is a test post');
  await page.selectOption('select[name="category"]', '1');
  
  // Save draft
  await page.click('text=Save Draft');
  await expect(page.locator('text=Post saved successfully')).toBeVisible();
  
  // Publish
  await page.click('text=Publish');
  await expect(page.locator('text=Post published successfully')).toBeVisible();
});
```

---

## 7. Deployment

### 7.1 Production Server Requirements

**Minimum Specifications:**
- CPU: 2 cores
- RAM: 4GB
- Disk: 50GB SSD
- OS: Ubuntu 22.04 LTS

**Recommended for Scale:**
- CPU: 4 cores
- RAM: 8GB
- Disk: 100GB SSD

---

### 7.2 Deployment Checklist

**Pre-Deployment:**
- [ ] All environment variables configured
- [ ] Database backup created
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Domain DNS configured
- [ ] Server security hardened (firewall, SSH keys)

**Deployment Steps:**
1. Install Node.js 20 LTS
2. Install PostgreSQL 15
3. Clone repository to server
4. Install dependencies (`npm ci`)
5. Run database migrations
6. Build frontend (`npm run build`)
7. Configure Nginx reverse proxy
8. Set up PM2 for process management
9. Enable PM2 startup script
10. Configure SSL with Certbot

**Post-Deployment:**
- [ ] Smoke tests passed
- [ ] Monitoring configured (Sentry, UptimeRobot)
- [ ] Backup cron job scheduled
- [ ] Log rotation configured
- [ ] Team notified

---

### 7.3 Nginx Configuration

```nginx
# /etc/nginx/sites-available/morphe-cms
server {
    listen 80;
    server_name api.morphelabs.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.morphelabs.com;

    ssl_certificate /etc/letsencrypt/live/api.morphelabs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.morphelabs.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 10M;
}

# Admin Panel
server {
    listen 443 ssl http2;
    server_name admin.morphelabs.com;

    ssl_certificate /etc/letsencrypt/live/admin.morphelabs.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.morphelabs.com/privkey.pem;

    root /var/www/morphe-cms-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

### 7.4 PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'morphe-cms-api',
    script: 'dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

**Commands:**
```bash
# Start application
pm2 start ecosystem.config.js

# Save process list
pm2 save

# Setup startup script
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs morphe-cms-api
```

---

## 8. Monitoring & Maintenance

### 8.1 Monitoring Tools

| Tool | Purpose | Setup |
|------|---------|-------|
| Sentry | Error tracking | Add Sentry SDK to backend and frontend |
| UptimeRobot | Uptime monitoring | Configure HTTP checks for API and admin panel |
| PM2 Monitoring | Process health | Use `pm2 monit` or PM2 Plus |
| PostgreSQL Logs | Database monitoring | Configure log rotation |

---

### 8.2 Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-cms.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/morphe-cms"
DB_NAME="morphe_cms_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Uploaded files backup (if using local storage)
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz /var/www/morphe-cms/uploads

# Retention: Keep last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

**Cron Schedule (Daily at 2 AM):**
```bash
0 2 * * * /opt/scripts/backup-cms.sh >> /var/log/cms-backup.log 2>&1
```

---

## 9. Team Roles & Responsibilities

### 9.1 Recommended Team Structure

**Option 1: 2 Developers**
- **Developer 1 (Full-Stack Lead):** Backend architecture, authentication, deployment
- **Developer 2 (Full-Stack):** Frontend development, blog module, UI/UX

**Option 2: 3 Developers**
- **Developer 1 (Backend Lead):** API development, database, security
- **Developer 2 (Frontend Lead):** React admin panel, UI components
- **Developer 3 (Full-Stack):** Support both teams, testing, deployment

---

### 9.2 Daily Standup Format

**Time:** 9:30 AM (15 minutes)

**Questions:**
1. What did you complete yesterday?
2. What will you work on today?
3. Any blockers or concerns?

---

### 9.3 Sprint Planning (Bi-Weekly)

**Activities:**
1. Review completed work from last sprint
2. Plan tasks for next 2 weeks
3. Assign tasks to team members
4. Estimate effort (story points or hours)
5. Identify dependencies and risks

---

## 10. Risk Management

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | High | High | Strict adherence to PRD, change request process |
| Third-party API changes | Low | Medium | Use stable versions, monitor changelogs |
| Security breach | Medium | High | Regular security audits, dependency updates |
| Developer unavailability | Medium | Medium | Code documentation, pair programming |
| Database performance issues | Low | High | Query optimization, indexing, load testing |
| Deployment failures | Low | High | Staging environment testing, rollback plan |

---

## Appendix A: Useful Commands

### Backend Commands
```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript
npm start                # Start production server
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run lint             # Run ESLint
npm run format           # Run Prettier

# Database
npx sequelize-cli db:migrate           # Run migrations
npx sequelize-cli db:migrate:undo      # Rollback last migration
npx sequelize-cli db:seed:all          # Run seeders
```

### Frontend Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm test                 # Run tests
npm run lint             # Run ESLint
```

---

**End of Implementation Plan**