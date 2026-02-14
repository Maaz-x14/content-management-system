# Morphe Labs Custom CMS - Complete Technical Specification & Project Plan

## Role & Context
You are a senior full-stack architect and technical project manager with 10+ years of experience building custom content management systems. You specialize in designing scalable, maintainable web applications with modern technology stacks. Your expertise includes database architecture, API design, security best practices, and frontend development.

You are tasked with creating a comprehensive technical specification document for **Morphe Labs**, a technology company that needs a custom CMS to manage their website content without relying on third-party platforms.

---

## Project Overview

<project_context>
**Company**: Morphe Labs  
**Project**: Custom Content Management System (CMS)  
**Goal**: Build a self-hosted CMS that allows non-technical staff to easily update website content across three primary modules

**Current Situation**:
- Morphe Labs currently lacks a unified content management solution
- Content updates require developer intervention, creating bottlenecks
- The company has an existing brand design system and color palette that must be preserved
- Staff members have varying technical abilities (from non-technical to moderately technical)

**Success Criteria**:
- Non-technical staff can create, edit, and publish content independently
- System maintains brand consistency automatically
- All modules are responsive and mobile-friendly
- Content is delivered efficiently to the frontend
- Role-based permissions prevent unauthorized changes
- Development can be completed in a reasonable timeframe with clear milestones
</project_context>

---

## Required Modules

<modules>
The CMS must include three core modules:

### 1. Blog/Article Management
- Create, edit, delete, and publish blog posts and articles
- Rich text editor with formatting options (headings, lists, links, images, code blocks)
- Featured image upload and management
- Categories and tags for organization
- Author attribution
- SEO fields (meta title, description, keywords)
- Draft/Published status
- Scheduled publishing capability
- Search and filter functionality

### 2. Services/Portfolio Management
- Showcase company services and past projects
- Upload project images/galleries (multiple images per project)
- Project details: title, description, technologies used, client name (optional), project URL
- Service descriptions with icon support
- Case studies with detailed write-ups
- Filter by category, technology, or industry
- Featured/highlight flag for homepage display

### 3. Careers/Job Listings
- Post job openings with detailed descriptions
- Job fields: title, department, location (remote/on-site/hybrid), employment type (full-time/part-time/contract)
- Salary range (optional, can be hidden)
- Required qualifications and preferred qualifications
- Application deadline
- Active/Inactive status
- Application tracking (basic - store applicant data)
- Export applicant data to CSV
</modules>

---

## Technical Requirements

<technical_requirements>

### Must-Have Features:
1. **User-Friendly Admin Panel**
   - Intuitive dashboard with clear navigation
   - WYSIWYG editor for content creation
   - Drag-and-drop file uploads
   - Real-time preview before publishing
   - Responsive design (works on tablets and desktops)

2. **Brand Consistency**
   - Use Morphe Labs' existing design system
   - Do NOT create new visual designs or redesign the brand
   - System should output content that matches existing brand colors, typography, and spacing
   - Admin panel can have a neutral, professional design (not necessarily branded)

3. **Responsive & Modern**
   - All frontend output must be fully responsive (mobile, tablet, desktop)
   - Follow modern web standards (HTML5, CSS3, ES6+)
   - Accessible (WCAG 2.1 Level AA compliance where possible)
   - Fast load times (optimize images, lazy loading, etc.)

4. **Role-Based Access Control (RBAC)**
   - At minimum three roles: Super Admin, Editor, Viewer
   - Super Admin: Full access (create/edit/delete users, all content, settings)
   - Editor: Create/edit/delete content in assigned modules, cannot manage users
   - Viewer: Read-only access (for stakeholders to review content)
   - Permission system should be extendable for future roles

5. **Security Considerations**
   - Authentication: Secure login system (bcrypt/argon2 for password hashing)
   - Authorization: Role-based middleware for all sensitive routes
   - Input validation and sanitization on all forms
   - Protection against: SQL injection, XSS, CSRF, clickjacking
   - HTTPS enforcement (assume production deployment uses SSL)
   - File upload restrictions (type, size limits)
   - Rate limiting on login attempts and API endpoints
   - Secure session management (httpOnly cookies, session expiration)
   - Regular dependency updates and security patches plan

6. **API Structure**
   - RESTful API design for frontend-backend communication
   - Clear endpoint naming conventions
   - Proper HTTP methods (GET, POST, PUT/PATCH, DELETE)
   - Consistent response formats (JSON)
   - Error handling with meaningful error messages
   - API versioning strategy (e.g., /api/v1/...)
   - API documentation (auto-generated if possible)

7. **Database Requirements**
   - Normalized schema design (avoid redundancy)
   - Proper indexing for performance
   - Foreign key relationships where appropriate
   - Migration system for schema changes
   - Backup and restore capability
   - Support for both development and production environments
</technical_requirements>

---

## Your Task

<task_instructions>
Create a **comprehensive technical specification document** that includes ALL of the following sections. Be thorough, specific, and actionable. This document will be used by a development team to build the CMS.

### Required Sections:

#### 1. Technology Stack Recommendation
Provide your recommended technology stack with clear justifications for each choice:

**Required Components**:
- **Backend Framework**: (e.g., Node.js with Express, Python with Django/Flask, PHP with Laravel, Ruby on Rails, etc.)
- **Frontend Framework/Library**: (e.g., React, Vue, Svelte, or server-side rendering)
- **Database**: (e.g., PostgreSQL, MySQL, MongoDB)
- **Authentication**: (e.g., JWT, sessions, OAuth)
- **File Storage**: (e.g., local filesystem, AWS S3, Cloudinary)
- **Additional Tools**: (any other essential tools or services)

**For each technology choice, explain**:
- Why this technology is suitable for this project
- Pros and cons
- Alternatives considered
- Learning curve for the team (assume intermediate developers)

**Example Format**:
```
Backend: Node.js with Express.js
Justification: 
- Lightweight and flexible for building RESTful APIs
- Large ecosystem of packages (bcrypt, multer for file uploads, etc.)
- JavaScript on both frontend and backend reduces context switching
- Excellent for real-time features if needed in future
Pros: Fast development, large community, non-blocking I/O
Cons: Callback hell if not using async/await, less opinionated than frameworks like Rails
Alternatives: Django (more batteries-included), Laravel (great ORM)
Learning Curve: Low to medium (team already knows JavaScript)
```

---

#### 2. Database Schema Design
Provide a **complete, normalized database schema** for all three modules.

**Requirements**:
- List all tables/collections
- For each table, specify:
  - Table name
  - All fields/columns with data types
  - Primary keys
  - Foreign keys and relationships
  - Indexes (for performance)
  - Constraints (NOT NULL, UNIQUE, etc.)
- Use proper naming conventions (snake_case or camelCase consistently)
- Include timestamps (created_at, updated_at) for audit trails
- Include soft delete fields if applicable (deleted_at)

**Minimum Tables Needed**:
- Users (for authentication and role management)
- Roles (or role field in Users table)
- Blog Posts/Articles
- Categories (for blog)
- Tags (for blog, many-to-many relationship)
- Services/Portfolio Projects
- Job Listings
- Job Applications (for careers module)
- Media/Files (centralized file management, optional but recommended)

**Example Format**:
```sql
Table: users
Fields:
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- full_name (VARCHAR(255), NOT NULL)
- role_id (INT, FOREIGN KEY -> roles.id, NOT NULL)
- is_active (BOOLEAN, DEFAULT true)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

Indexes:
- email (for fast login lookups)
- role_id (for permission checks)
```

**Provide the complete schema for ALL tables.** Include an entity-relationship diagram description (or ASCII art if possible).

---

#### 3. API Structure & Endpoints
Design a **complete RESTful API** for all CMS operations.

**Requirements**:
- List all endpoints organized by module
- For each endpoint, specify:
  - HTTP Method (GET, POST, PUT, PATCH, DELETE)
  - Route path (e.g., /api/v1/blog/posts)
  - Description of what it does
  - Required permissions/roles
  - Request body format (for POST/PUT/PATCH)
  - Response format (success and error cases)
  - Query parameters (for filtering, pagination, sorting)

**Must Include**:
- Authentication endpoints (login, logout, refresh token if using JWT)
- CRUD operations for all content types (blog, services, jobs)
- File upload endpoints
- User management endpoints (for admins)
- Search/filter endpoints

**Example Format**:
```
POST /api/v1/auth/login
Description: Authenticate user and return access token
Permissions: Public (no authentication required)
Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}
Response (Success - 200):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "editor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
Response (Error - 401):
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
}

---

GET /api/v1/blog/posts
Description: Retrieve list of blog posts (with pagination and filtering)
Permissions: Public (for frontend), Admin/Editor (for draft posts in admin)
Query Parameters:
- page (number, default: 1)
- limit (number, default: 10, max: 100)
- status (string: 'published' | 'draft', default: 'published' for public)
- category (string, optional: filter by category slug)
- search (string, optional: search in title and content)
- sort (string: 'newest' | 'oldest' | 'popular', default: 'newest')
Response (Success - 200):
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Getting Started with React",
        "slug": "getting-started-with-react",
        "excerpt": "Learn the basics of React...",
        "featured_image": "https://example.com/uploads/react.jpg",
        "author": {
          "id": 2,
          "full_name": "Jane Smith"
        },
        "category": {
          "id": 1,
          "name": "Tutorials",
          "slug": "tutorials"
        },
        "tags": ["react", "javascript", "frontend"],
        "published_at": "2024-01-15T10:30:00Z",
        "read_time_minutes": 8
      },
      // ... more posts
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 47,
      "items_per_page": 10
    }
  }
}
```

**Provide ALL endpoints for the CMS.** Group them logically (Auth, Blog, Services, Careers, Users, Media).

---

#### 4. Admin Panel Requirements
Describe the **admin panel interface and functionality** in detail.

**Requirements**:

**Layout & Navigation**:
- Dashboard overview page (what stats/metrics should be shown?)
- Sidebar or top navigation menu structure
- Breadcrumb navigation for deep pages
- User profile menu (logout, change password, settings)

**Key Pages & Features**:

For each module (Blog, Services, Careers), describe:
- List view (table/grid showing all items)
  - Columns to display
  - Sorting and filtering options
  - Bulk actions (delete, change status, etc.)
  - Search functionality
- Create/Edit view
  - Form fields and their types (text input, textarea, rich text editor, file upload, dropdown, etc.)
  - Validation rules for each field
  - Save as draft vs. Publish button
  - Preview functionality
- Delete confirmation flow

**User Management** (for Super Admins):
- List all users
- Create/edit/deactivate users
- Assign roles
- Reset password functionality

**Media Library**:
- Upload interface (drag-and-drop, multiple files)
- File browser (grid or list view)
- Search and filter media
- File details (size, dimensions, upload date)
- Delete and replace files

**Settings** (optional but recommended):
- Site settings (site name, logo, contact email)
- SEO defaults (default meta description, etc.)
- Email notification settings
- API keys or integrations

**Example Description**:
```
Dashboard Page:
- Welcome message with user's name
- Quick stats cards:
  - Total blog posts (published vs drafts)
  - Total portfolio projects
  - Active job listings
  - Pending job applications (number)
- Recent activity feed (last 10 content updates)
- Quick actions: "New Blog Post", "New Job Listing", "Upload Media"

Blog List Page:
- Table view with columns: Title, Author, Category, Status (badge), Published Date, Actions
- Filters: Status (All/Published/Draft), Category (dropdown), Author (dropdown)
- Search bar: Search by title or content
- Bulk actions: Delete selected, Change status to Published/Draft
- Pagination: 20 items per page
- Sort by: Title (A-Z), Published Date (newest/oldest), Author
- "New Post" button (top-right)

Blog Create/Edit Page:
- Form fields:
  1. Title (required, text input, max 200 chars)
  2. Slug (auto-generated from title, editable, unique)
  3. Featured Image (file upload, image preview, recommended size: 1200x630px)
  4. Excerpt (optional, textarea, max 300 chars, used for previews)
  5. Content (required, rich text editor with toolbar: headings, bold, italic, links, images, code blocks, lists)
  6. Category (required, dropdown, with "Add New Category" option)
  7. Tags (multi-select or tag input, autocomplete from existing tags)
  8. SEO Section (collapsible):
     - Meta Title (optional, default to post title, max 60 chars)
     - Meta Description (optional, default to excerpt, max 160 chars)
  9. Author (auto-filled with current user, can be changed by Super Admins)
  10. Published Date (datetime picker, default to current time)
- Buttons: "Save as Draft", "Publish", "Preview", "Cancel"
- Validation: Show inline errors for required fields
- Auto-save draft every 30 seconds (show "Draft saved" indicator)
```

**Provide detailed descriptions for ALL admin panel pages and workflows.**

---

#### 5. Frontend Integration Approach
Explain how the CMS will deliver content to the Morphe Labs frontend website.

**Requirements**:

**Architecture Decision**:
Choose ONE approach and justify it:
- **Option A: Headless CMS** (API-first, frontend is a separate application)
  - CMS provides only API endpoints
  - Frontend (e.g., Next.js, Gatsby, Vue/Nuxt) consumes the API
  - Completely decoupled architecture
- **Option B: Traditional CMS** (CMS renders frontend pages)
  - CMS includes frontend templating (e.g., EJS, Handlebars, Blade)
  - Server-side rendering of public pages
  - Monolithic architecture
- **Option C: Hybrid** (CMS admin + API, with simple frontend for previews)

**For your chosen approach, describe**:
- How content flows from admin panel to public website
- Frontend technology stack (if separate from backend)
- How to handle the existing brand design system
  - Where do CSS/design tokens live?
  - How to ensure brand consistency?
- Caching strategy (if any) for performance
- How to handle images and media on the frontend
- Example page rendering flow (e.g., "User clicks on blog post -> API request -> Render page with data")

**Example**:
```
Chosen Approach: Headless CMS (Option A)

Justification:
- Maximum flexibility: Frontend can be rebuilt without touching CMS
- Better performance: Can use static site generation (SSG) with Next.js
- Scalability: Can serve multiple frontends (web, mobile app) from same API
- Morphe Labs can update their website design independently of the CMS

Architecture:
1. CMS Backend: Node.js/Express API (port 5000)
2. Admin Panel: React SPA served from CMS backend (or separate deployment)
3. Public Website: Next.js app (port 3000) consuming CMS API

Content Flow:
1. Editor creates blog post in admin panel
2. POST request to /api/v1/blog/posts (saves to database)
3. Editor clicks "Publish"
4. Public website fetches posts via GET /api/v1/blog/posts (only published)
5. Next.js uses getStaticProps() to fetch at build time (SSG)
6. Pages are pre-rendered and served as static HTML

Brand Design System Integration:
- Morphe Labs' existing design system (CSS/SCSS) lives in Next.js frontend
- Admin panel uses a neutral UI library (e.g., Ant Design, Material-UI)
- CMS API returns raw content (text, HTML, image URLs)
- Frontend components apply Morphe Labs styles when rendering
- Design tokens (colors, fonts, spacing) defined in frontend config

Caching:
- API responses cached with Redis (5 minute TTL for public endpoints)
- Next.js uses ISR (Incremental Static Regeneration) to rebuild pages every 60 seconds
- CDN caching for static assets and images

Media Handling:
- Images uploaded to CMS are stored in /uploads folder
- CMS API returns full URLs: https://cms.morphelabs.com/uploads/filename.jpg
- Frontend uses Next.js Image component for automatic optimization
- Lazy loading for below-fold images
```

---

#### 6. Security Implementation Plan
Provide a **detailed security implementation checklist** covering all aspects of the CMS.

**Requirements**:

**Authentication & Authorization**:
- How will passwords be hashed? (algorithm, salt rounds)
- Session management strategy (JWTs vs server-side sessions)
- Token expiration and refresh mechanism
- Multi-factor authentication (MFA) - recommended for future phase?
- Password reset flow (secure token generation, expiration)

**Input Validation & Sanitization**:
- Where and how to validate user inputs (client-side + server-side)
- List specific validations for each content type (e.g., email format, max lengths, allowed file types)
- How to prevent XSS (escape HTML in rich text editor, Content Security Policy)
- How to prevent SQL injection (parameterized queries, ORM usage)

**API Security**:
- CORS configuration (which origins are allowed?)
- Rate limiting (how many requests per minute per IP?)
- API authentication (how do frontend apps authenticate to API?)
- HTTPS enforcement (redirect HTTP to HTTPS)
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)

**File Upload Security**:
- Allowed file types (whitelist, not blacklist)
- File size limits
- Filename sanitization (remove special characters, prevent path traversal)
- Store uploaded files outside web root (or use signed URLs)
- Virus scanning (optional, for enterprise)

**Database Security**:
- Use environment variables for database credentials
- Principle of least privilege (database user has only necessary permissions)
- Regular backups and tested restore process
- Encryption at rest (if handling sensitive data)

**Dependency Management**:
- Use npm audit / yarn audit regularly
- Automated dependency updates (Dependabot, Renovate)
- Pin dependency versions in production

**Logging & Monitoring**:
- Log all authentication attempts (success and failure)
- Log all admin actions (who changed what, when)
- Do NOT log sensitive data (passwords, tokens)
- Set up alerts for suspicious activity (e.g., multiple failed logins)

**Example Format**:
```
Authentication:
✓ Use bcrypt with 12 salt rounds for password hashing
✓ Implement JWT-based authentication with httpOnly cookies
✓ Access token expiration: 15 minutes
✓ Refresh token expiration: 7 days
✓ Refresh token rotation (issue new refresh token on each refresh)
✓ Password requirements: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
✓ Account lockout after 5 failed login attempts (30 minute cooldown)

Input Validation (Blog Post Example):
✓ Title: Required, 1-200 chars, trim whitespace, escape HTML
✓ Slug: Required, unique, lowercase, alphanumeric + hyphens only
✓ Content: Required, sanitize HTML (allow safe tags only: <p>, <h1-h6>, <strong>, <em>, <a>, <ul>, <ol>, <li>, <code>, <pre>, <img>)
✓ Featured Image: Optional, validate file type (JPEG, PNG, WebP only), max 5MB
✓ Category ID: Required, must exist in categories table (prevent orphan references)

File Upload:
✓ Whitelist: image/* (JPEG, PNG, GIF, WebP), application/pdf
✓ Max size: 10MB for images, 5MB for PDFs
✓ Generate unique filename (UUID) to prevent collisions and path traversal
✓ Store in /var/www/cms/storage/uploads (not in public web root)
✓ Serve via API endpoint /api/v1/media/:id (check permissions before serving)
```

**Provide complete security checklist for the entire CMS.**

---

#### 7. Development Timeline & Milestones
Create a **realistic project timeline** broken into phases with specific deliverables.

**Requirements**:
- Assume a team of 2-3 intermediate full-stack developers
- Total timeline should be 8-16 weeks (2-4 months)
- Break project into 4-6 major phases
- For each phase, include:
  - Duration (in weeks)
  - Deliverables (what will be completed)
  - Dependencies (what must be done first)
  - Testing/QA checkpoints

**Example Format**:
```
Phase 1: Project Setup & Core Infrastructure (Week 1-2)
Duration: 2 weeks
Deliverables:
- Project repository setup (Git, branching strategy)
- Development environment configuration (Docker/local setup)
- Database schema implemented and migrated
- Backend project structure (folders, config files)
- Authentication system (register, login, logout, password reset)
- Basic user management (CRUD operations for users)
- Role-based middleware for authorization
Dependencies: None (starting phase)
Testing: Unit tests for auth functions, integration tests for user endpoints
Team: All developers collaborate on setup

Phase 2: Admin Panel Foundation (Week 3-4)
Duration: 2 weeks
Deliverables:
- Admin panel UI framework setup (React + routing)
- Responsive layout with sidebar navigation
- Dashboard page (static, with placeholder stats)
- User management UI (list, create, edit, delete users)
- Role assignment interface
- Media upload functionality (file upload API + frontend)
- Media library UI (grid view, search, delete)
Dependencies: Phase 1 (auth must be complete)
Testing: Manual testing of UI flows, API endpoint tests for media uploads
Team: 1 developer on backend (media API), 2 developers on frontend (admin UI)

Phase 3: Blog Module Implementation (Week 5-7)
Duration: 3 weeks
Deliverables:
- Blog post CRUD API endpoints
- Category and tag management (API + UI)
- Rich text editor integration (TinyMCE, Quill, or Draft.js)
- Blog post list page (with filters, search, pagination)
- Blog post create/edit page (all fields, validation, draft/publish)
- Blog post preview functionality
- SEO fields implementation
- Scheduled publishing (cron job or task queue)
Dependencies: Phase 2 (media library must be ready for featured images)
Testing: End-to-end tests for blog CRUD, validation tests, cron job testing
Team: 1 dev on backend API, 1 dev on admin UI, 1 dev on frontend integration (if headless)

Phase 4: Services/Portfolio Module (Week 8-9)
Duration: 2 weeks
Deliverables:
- Portfolio project CRUD API endpoints
- Project gallery support (multiple images per project)
- Portfolio list page in admin (with filters)
- Portfolio create/edit page (image gallery uploader)
- Service management (if separate from projects)
Dependencies: Phase 3 (similar structure to blog module)
Testing: CRUD operation tests, image upload tests
Team: Same as Phase 3 (can reuse patterns)

Phase 5: Careers Module (Week 10-11)
Duration: 2 weeks
Deliverables:
- Job listing CRUD API endpoints
- Job application submission API (public endpoint)
- Job application storage (capture applicant data)
- Job listing admin pages (list, create, edit, delete)
- Job application management page (view applicants, export to CSV)
- Email notification on new application (optional)
Dependencies: Phase 4 (all modules follow similar pattern)
Testing: Application submission flow, CSV export functionality
Team: 1 dev on backend, 1 dev on admin UI, 1 dev on frontend (job listing display)

Phase 6: Frontend Integration & Polish (Week 12-14)
Duration: 3 weeks
Deliverables:
- Public-facing pages for all modules (if traditional CMS)
  OR Next.js frontend consuming API (if headless)
- Brand design system integration (CSS, components)
- Responsive design for mobile/tablet (all pages)
- SEO optimization (meta tags, sitemaps, robots.txt)
- Performance optimization (caching, image optimization, lazy loading)
- Accessibility improvements (ARIA labels, keyboard navigation, color contrast)
- Admin panel UX improvements (loading states, error messages, success toasts)
Dependencies: Phase 5 (all modules must be complete)
Testing: Cross-browser testing, mobile testing, accessibility audit, performance testing (Lighthouse)
Team: All developers + designer (if available) for design system integration

Phase 7: Testing, Deployment & Documentation (Week 15-16)
Duration: 2 weeks
Deliverables:
- Comprehensive testing (unit, integration, e2e tests for all modules)
- User acceptance testing (UAT) with Morphe Labs team
- Bug fixes and refinements based on feedback
- Deployment to staging environment
- Production deployment (server setup, SSL, domain configuration)
- Deployment documentation (how to deploy, environment variables, etc.)
- User documentation (admin guide for content creators)
- Developer documentation (API docs, codebase overview, how to run locally)
- Handoff and training session for Morphe Labs team
Dependencies: Phase 6 (all features must be complete)
Testing: Final QA, stress testing, security audit
Team: All developers + project manager for handoff

Total Duration: 16 weeks (4 months)

Risk Mitigation:
- Buffer time built into each phase (10-15% extra)
- Weekly check-ins to track progress and adjust scope if needed
- Prioritize MVP features first (can defer nice-to-haves to Phase 8 if needed)
```

**Provide a complete timeline with all phases detailed.**

---

#### 8. Additional Recommendations
Provide any additional best practices, recommendations, or considerations for the project.

**Optional but Valuable**:
- Deployment strategy (where to host? AWS, DigitalOcean, Vercel, etc.)
- CI/CD pipeline suggestions (GitHub Actions, GitLab CI, etc.)
- Monitoring and error tracking (Sentry, LogRocket, etc.)
- Backup strategy (automated database backups, frequency, retention)
- Scalability considerations (how will the system handle growth?)
- Future feature ideas (what could be added in v2.0?)
- Training materials for Morphe Labs team (video tutorials, written guides, etc.)
- Maintenance plan (how often to update dependencies, who handles support?)

**Example**:
```
Deployment Recommendations:
- Host backend on DigitalOcean App Platform or AWS Elastic Beanstalk (easy scaling)
- Host frontend (if headless) on Vercel or Netlify (automatic deployments from Git)
- Use AWS S3 or Cloudflare R2 for media storage (scalable, CDN integration)
- Database: Managed PostgreSQL (DigitalOcean Managed Databases, AWS RDS)

CI/CD Pipeline:
- Use GitHub Actions for automated testing and deployment
- On every push to `main` branch: run tests -> deploy to staging
- Manual approval step for production deployment (prevent accidental deploys)
- Automatic Slack/email notifications on successful/failed deployments

Monitoring:
- Sentry for error tracking (catches frontend and backend errors)
- Google Analytics or Plausible for website traffic
- Uptime monitoring (UptimeRobot, Pingdom) to alert if site goes down

Future Features (v2.0):
- Comment system for blog posts (with spam protection)
- Newsletter integration (send blog posts via email)
- Multi-language support (i18n for admin and content)
- Advanced analytics dashboard (most viewed posts, popular categories)
- Content scheduling for social media (auto-post to Twitter, LinkedIn)
- Version history for content (see previous versions, restore)
```

</task_instructions>

---

## Output Format

<output_format>
Structure your technical specification document using the following format:

```markdown
# Morphe Labs CMS - Technical Specification Document
Version 1.0 | [Current Date]

---

## Executive Summary
[2-3 paragraph overview of the project, goals, and approach]

---

## 1. Technology Stack

### 1.1 Backend Framework
[Your recommendation with justification]

### 1.2 Frontend Framework
[Your recommendation with justification]

### 1.3 Database
[Your recommendation with justification]

### 1.4 Authentication
[Your recommendation with justification]

### 1.5 File Storage
[Your recommendation with justification]

### 1.6 Additional Technologies
[Any other tools, libraries, or services]

---

## 2. Database Schema

### 2.1 Schema Overview
[High-level description of the database architecture]

### 2.2 Table Definitions

#### Users Table
[Complete definition as per requirements]

#### Roles Table
[Complete definition]

#### Blog Posts Table
[Complete definition]

[... All other tables ...]

### 2.3 Relationships & Indexes
[ER diagram description, foreign keys, indexes]

---

## 3. API Structure

### 3.1 API Design Principles
[REST conventions, naming, versioning]

### 3.2 Authentication Endpoints
[All auth-related endpoints]

### 3.3 Blog Module Endpoints
[All blog endpoints]

### 3.4 Services Module Endpoints
[All services endpoints]

### 3.5 Careers Module Endpoints
[All careers endpoints]

### 3.6 User Management Endpoints
[All user endpoints]

### 3.7 Media Endpoints
[All media endpoints]

---

## 4. Admin Panel Specifications

### 4.1 Layout & Navigation
[Dashboard, menu structure]

### 4.2 Blog Management Interface
[List, create, edit pages]

### 4.3 Services Management Interface
[List, create, edit pages]

### 4.4 Careers Management Interface
[List, create, edit pages, application management]

### 4.5 User Management Interface
[For Super Admins]

### 4.6 Media Library Interface
[Upload, browse, manage files]

---

## 5. Frontend Integration Strategy

### 5.1 Architecture Approach
[Headless, traditional, or hybrid - with justification]

### 5.2 Content Delivery Flow
[How content gets from admin to public site]

### 5.3 Brand Design System Integration
[How existing design is applied]

### 5.4 Performance & Caching
[Strategy for fast load times]

---

## 6. Security Implementation

### 6.1 Authentication & Authorization
[Detailed security for auth]

### 6.2 Input Validation
[All validation rules]

### 6.3 API Security
[CORS, rate limiting, headers]

### 6.4 File Upload Security
[Secure file handling]

### 6.5 Database Security
[Protection measures]

### 6.6 Logging & Monitoring
[What to log, how to monitor]

---

## 7. Development Timeline

### Phase 1: [Name] (Week X-Y)
[Duration, deliverables, dependencies, testing]

### Phase 2: [Name] (Week X-Y)
[Duration, deliverables, dependencies, testing]

[... All phases ...]

### Project Summary
[Total duration, team size, key milestones]

---

## 8. Additional Recommendations

### 8.1 Deployment Strategy
[Where and how to deploy]

### 8.2 CI/CD Pipeline
[Automation recommendations]

### 8.3 Monitoring & Error Tracking
[Tools and setup]

### 8.4 Backup & Recovery
[Backup strategy]

### 8.5 Future Enhancements
[v2.0 features]

### 8.6 Training & Documentation
[Knowledge transfer plan]

---

## Appendix

### A. Glossary
[Technical terms used in this document]

### B. References
[Links to relevant documentation, tools, etc.]

### C. Assumptions
[Any assumptions made during planning]
```
</output_format>

---

## Important Guidelines

<guidelines>
1. **Be Comprehensive**: Do not skip any required section. Provide complete details for every part of the specification.

2. **Be Specific**: Avoid vague statements like "implement security measures." Instead, specify exact techniques (e.g., "use bcrypt with 12 salt rounds").

3. **Be Realistic**: Ensure your recommendations are practical for a team of 2-3 developers with intermediate skills. Don't over-engineer.

4. **Be Consistent**: Use the same naming conventions, terminology, and format throughout the document.

5. **Think Step-by-Step**: 
   - First, consider the overall architecture (headless vs traditional)
   - Then design the database schema (normalize properly)
   - Then design the API (follow REST principles)
   - Then describe the admin UI (user-friendly flows)
   - Then plan security (defense in depth)
   - Finally, create a realistic timeline (accounting for dependencies)

6. **Justify Decisions**: Every major technology choice should include a clear justification. Explain WHY, not just WHAT.

7. **Consider the User**: Remember that non-technical staff will use this system. Keep the admin panel simple and intuitive.

8. **Prioritize Security**: Security is non-negotiable. Every section should consider security implications.

9. **Plan for Maintainability**: Choose technologies and patterns that will be easy to maintain and extend in the future.

10. **Use Examples**: Provide concrete examples (code snippets, JSON responses, UI descriptions) to illustrate abstract concepts.
</guidelines>

---

## Evaluation Criteria

<evaluation_criteria>
Your technical specification will be evaluated based on:

**Completeness (30%)**
- All 8 required sections are present and thoroughly detailed
- All tables, endpoints, and pages are specified
- No major gaps or missing information

**Technical Soundness (25%)**
- Technology choices are appropriate and well-justified
- Database schema is normalized and efficient
- API design follows REST principles
- Security measures are comprehensive and current

**Clarity & Organization (20%)**
- Document is well-structured and easy to navigate
- Technical language is precise but understandable
- Examples and diagrams support explanations
- Consistent formatting and terminology

**Practicality (15%)**
- Timeline is realistic for the team size and scope
- Recommendations are actionable and specific
- Balances ideal practices with practical constraints
- Considers the real-world context (budget, timeline, team skills)

**User Focus (10%)**
- Admin panel design prioritizes ease of use for non-technical users
- Frontend integration respects the existing brand
- Security doesn't compromise usability unnecessarily
- Content management workflows are intuitive
</evaluation_criteria>

---

## Before You Begin

<thinking_process>
Take a moment to think through the following before writing your specification:

1. **Architecture**: Should this be a headless CMS (API-first) or traditional CMS (monolithic)? What are the trade-offs for Morphe Labs?

2. **Technology**: What stack have you worked with successfully? What will be easiest for intermediate developers to learn and maintain?

3. **Database**: How should the three modules be structured? What relationships exist between entities? (e.g., blog posts -> categories, users -> blog posts)

4. **Scale**: How much content will Morphe Labs create? (Assume dozens of blog posts, 10-20 portfolio projects, 5-10 job listings at any time). Does this need to scale to thousands? Probably not initially.

5. **Team**: With 2-3 developers, how can work be parallelized? What can be built concurrently vs. sequentially?

6. **Timeline**: 16 weeks is approximately 4 months. Is this enough time? What can be cut if needed? What's the MVP?

Remember: **The goal is to create a document that a development team can pick up and start building from immediately, with minimal ambiguity.**
</thinking_process>

---

## Final Checklist

<final_checklist>
Before submitting your technical specification, verify:

- [ ] All 8 sections are complete and detailed
- [ ] Technology stack includes justifications for each choice
- [ ] Database schema includes ALL tables with complete field definitions
- [ ] API endpoints cover ALL operations (auth, blog, services, careers, users, media)
- [ ] Admin panel descriptions include specific UI elements and workflows
- [ ] Frontend integration approach is clearly explained with content flow
- [ ] Security section includes specific implementations (not just "add security")
- [ ] Timeline includes 4-6 phases with realistic durations and clear deliverables
- [ ] Additional recommendations provide actionable advice
- [ ] Document is well-formatted, consistent, and professional
- [ ] No placeholder text like "[TODO]" or "[Fill this in]" remains
- [ ] Examples are concrete and illustrative
- [ ] The document is ready for immediate use by a development team
</final_checklist>

---

**You may now begin creating the comprehensive technical specification document for Morphe Labs Custom CMS.**

Remember: This document will be used to build the actual system. Thoroughness and precision are critical. Take your time to think through each section carefully.

