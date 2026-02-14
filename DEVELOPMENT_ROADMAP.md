# Morphe Labs CMS - Development Roadmap

## 🗺️ Complete Development Path

This document provides a step-by-step roadmap to complete the Morphe Labs CMS project.

---

## Phase 1: Foundation ✅ COMPLETE

**Duration:** Week 1-2  
**Status:** ✅ DONE

- [x] Backend project structure
- [x] TypeScript, ESLint, Prettier configuration
- [x] Environment variables setup
- [x] Core utilities (logger, error handling, encryption, slugify)
- [x] Configuration files (database, auth, upload, email)
- [x] Documentation (README, guides)

---

## Phase 2: Database & Models ✅ COMPLETE

**Duration:** Week 2-3  
**Priority:** CRITICAL - Everything depends on this

### Step 1: Create Database Models

Create these files in `backend/src/models/`:

#### 1.1 Role Model
```typescript
// src/models/Role.model.ts
- id, name, slug, description, permissions (JSONB)
- Timestamps
```

#### 1.2 User Model
```typescript
// src/models/User.model.ts
- id, email, password_hash, full_name, role_id
- is_active, last_login
- password_reset_token, password_reset_expires
- Timestamps, soft delete
- Relationship: belongsTo Role
```

#### 1.3 Category Model
```typescript
// src/models/Category.model.ts
- id, name, slug, description, parent_id, display_order
- Timestamps
- Relationship: hasMany BlogPost, belongsTo Category (self-reference)
```

#### 1.4 Tag Model
```typescript
// src/models/Tag.model.ts
- id, name, slug, usage_count
- Timestamps
- Relationship: belongsToMany BlogPost through PostTag
```

#### 1.5 BlogPost Model
```typescript
// src/models/BlogPost.model.ts
- id, title, slug, content, excerpt, status
- featured_image, published_at, scheduled_for
- author_id, category_id, view_count
- SEO fields (meta_title, meta_description, meta_keywords, canonical_url)
- Timestamps, soft delete
- Relationships: belongsTo User (author), belongsTo Category, belongsToMany Tag
```

#### 1.6 PostTag Model (Junction)
```typescript
// src/models/PostTag.model.ts
- post_id, tag_id
- Timestamp
```

#### 1.7 Service Model
```typescript
// src/models/Service.model.ts
- id, title, slug, description, client_name
- project_url, project_date, project_duration, status, featured
- category, technologies (array), industry
- case_study fields (challenge, solution, results, metrics JSONB)
- created_by, display_order
- Timestamps, soft delete
- Relationships: belongsTo User, hasMany ServiceImage
```

#### 1.8 ServiceImage Model
```typescript
// src/models/ServiceImage.model.ts
- id, service_id, image_url, caption
- is_primary, display_order
- Timestamp
- Relationship: belongsTo Service
```

#### 1.9 JobListing Model
```typescript
// src/models/JobListing.model.ts
- id, title, slug, department
- location fields (type, city, region, remote_policy)
- employment_type, description
- responsibilities, qualifications_required, qualifications_preferred, benefits (arrays)
- salary fields (min, max, currency, visible)
- application_deadline, status, internal_notes
- posted_by
- Timestamps, soft delete
- Relationships: belongsTo User, hasMany JobApplication
```

#### 1.10 JobApplication Model
```typescript
// src/models/JobApplication.model.ts
- id, job_id, applicant_name, applicant_email, applicant_phone
- resume_url, resume_filename, cover_letter
- linkedin_url, portfolio_url
- status, notes
- applied_at, updated_at
- Relationship: belongsTo JobListing
```

#### 1.11 MediaFile Model
```typescript
// src/models/MediaFile.model.ts
- id, filename, original_name, file_path, file_url, thumbnail_url
- file_type, mime_type, file_size
- image_width, image_height, alt_text
- uploaded_by
- Timestamps, soft delete
- Relationship: belongsTo User
```

#### 1.12 Model Index
```typescript
// src/models/index.ts
- Import all models
- Define all associations
- Export all models
```

### Step 2: Create Database Migrations

Create these files in `backend/src/migrations/`:

```bash
npx sequelize-cli migration:generate --name create-roles
npx sequelize-cli migration:generate --name create-users
npx sequelize-cli migration:generate --name create-categories
npx sequelize-cli migration:generate --name create-tags
npx sequelize-cli migration:generate --name create-blog-posts
npx sequelize-cli migration:generate --name create-post-tags
npx sequelize-cli migration:generate --name create-services
npx sequelize-cli migration:generate --name create-service-images
npx sequelize-cli migration:generate --name create-job-listings
npx sequelize-cli migration:generate --name create-job-applications
npx sequelize-cli migration:generate --name create-media-files
```

Each migration should:
- Create table with all columns
- Add indexes
- Add foreign key constraints
- Add check constraints where needed

### Step 3: Create Database Seeders

```bash
npx sequelize-cli seed:generate --name roles
npx sequelize-cli seed:generate --name admin-user
npx sequelize-cli seed:generate --name categories
```

Seed data:
- **Roles:** Super Admin, Editor, Viewer with permissions
- **Admin User:** admin@morphelabs.com / Admin@123456
- **Categories:** Web Development, Mobile Apps, Design, etc.

### Step 4: Run Migrations and Seeders

```bash
npm run db:migrate
npm run db:seed
```

---

## Phase 3: Authentication System ✅ COMPLETE

**Duration:** Week 3-4  
**Priority:** HIGH

### Step 1: Create Middleware

#### 3.1 Error Middleware
```typescript
// src/middleware/error.middleware.ts
- Global error handler
- Handle ApiError, ValidationError, JWT errors, Sequelize errors
- Return consistent error responses
```

#### 3.2 Auth Middleware
```typescript
// src/middleware/auth.middleware.ts
- authenticate() - Verify JWT token
- Attach user to request
- Handle token expiration
```

#### 3.3 Permission Middleware
```typescript
// src/middleware/permission.middleware.ts
- authorize(roles[]) - Check user role
- checkOwnership() - Verify resource ownership
```

#### 3.4 Validation Middleware
```typescript
// src/middleware/validate.middleware.ts
- validate() - Check express-validator results
- Return validation errors
```

#### 3.5 Rate Limit Middleware
```typescript
// src/middleware/rateLimit.middleware.ts
- loginRateLimiter - 5 attempts per 15 min
- apiRateLimiter - 100 requests per 15 min
```

### Step 2: Create Services

#### 3.6 Email Service
```typescript
// src/services/email.service.ts
- sendPasswordResetEmail()
- sendWelcomeEmail()
- sendApplicationNotification()
```

#### 3.7 Auth Service
```typescript
// src/services/auth.service.ts
- login(email, password)
- logout(userId)
- refreshToken(refreshToken)
- requestPasswordReset(email)
- resetPassword(token, newPassword)
- getCurrentUser(userId)
```

#### 3.8 User Service
```typescript
// src/services/user.service.ts
- getAllUsers(filters, pagination)
- getUserById(id)
- createUser(data)
- updateUser(id, data)
- deleteUser(id) // soft delete
```

### Step 3: Create Controllers

#### 3.9 Auth Controller
```typescript
// src/controllers/auth.controller.ts
- login()
- logout()
- refresh()
- forgotPassword()
- resetPassword()
- getMe()
```

#### 3.10 User Controller
```typescript
// src/controllers/user.controller.ts
- getAllUsers()
- getUser()
- createUser()
- updateUser()
- deleteUser()
```

### Step 4: Create Routes

#### 3.11 Auth Routes
```typescript
// src/routes/auth.routes.ts
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

#### 3.12 User Routes
```typescript
// src/routes/user.routes.ts
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

#### 3.13 Route Index
```typescript
// src/routes/index.ts
- Aggregate all routes
- Export router
```

### Step 5: Create Main Server

#### 3.14 Server Entry Point
```typescript
// src/server.ts
- Initialize Express app
- Apply middleware (cors, helmet, morgan, body-parser)
- Mount routes
- Apply error handler
- Start server
- Connect to database
```

### Step 6: Test Authentication

Use Postman to test:
- ✅ Login with admin credentials
- ✅ Get current user
- ✅ Refresh token
- ✅ Password reset flow
- ✅ Create new user (Super Admin only)
- ✅ Unauthorized access returns 401
- ✅ Forbidden access returns 403

---

## Phase 4: Blog Module ✅ COMPLETE

**Duration:** Week 5-7

### Backend Tasks
1. Create blog.service.ts
2. Create category.service.ts
3. Create tag.service.ts
4. Create blog.controller.ts
5. Create category.controller.ts
6. Create tag.controller.ts
7. Create blog.routes.ts
8. Create public.routes.ts (for public blog endpoints)
9. Add validation rules
10. Test all endpoints

### Frontend Tasks (if parallel)
1. Create blog list page
2. Create blog editor with TipTap
3. Create category management
4. Create tag management
5. Add image upload
6. Add SEO fields
7. Add publishing workflow

---

## Phase 5: Services Module ✅ COMPLETE

**Duration:** Week 8-9

### Backend Tasks
1. Create service.service.ts
2. Create service.controller.ts
3. Create service.routes.ts
4. Handle multiple image uploads
5. Add validation
6. Test endpoints

### Frontend Tasks
1. Create service list page
2. Create service editor
3. Add image gallery management
4. Add case study editor
5. Add drag-and-drop image reordering

---

## Phase 6: Careers Module ✅ COMPLETE

**Duration:** Week 10-11

### Backend Tasks
1. Create career.service.ts
2. Create career.controller.ts
3. Create career.routes.ts
4. Handle resume uploads
5. Add email notifications
6. Add CSV export
7. Test endpoints

### Frontend Tasks
1. Create job list page
2. Create job editor
3. Create application viewer
4. Add status management
5. Add CSV export button

---

## Phase 7: Media Library 📁

**Duration:** Week 12-13

### Backend Tasks
1. Create upload.middleware.ts (Multer)
2. Create media.service.ts
3. Create media.controller.ts
4. Create media.routes.ts
5. Add image optimization (Sharp)
6. Test file uploads

### Frontend Tasks
1. Create media library page
2. Add drag-and-drop upload
3. Add file selection modal
4. Add file details panel

---

## Phase 8: Dashboard & Polish ✨

**Duration:** Week 14

### Tasks
1. Create dashboard with stats
2. Add recent activity feed
3. Add quick actions
4. Polish UI/UX
5. Add loading states
6. Add error states
7. Add empty states
8. Responsive design testing

---

## Phase 9: Testing & Documentation 🧪

**Duration:** Week 15-16

### Backend Testing
1. Write unit tests for services
2. Write integration tests for API
3. Test authentication/authorization
4. Test file uploads
5. Test error handling
6. Achieve 80%+ coverage

### Frontend Testing
1. Write component tests
2. Test form validation
3. Test API integration

### Documentation
1. API documentation (Swagger)
2. User manual for editors
3. Deployment guide
4. Update README files

---

## Phase 10: Deployment 🚀

### Tasks
1. Set up production environment variables
2. Configure production database
3. Set up cloud storage (S3/Spaces)
4. Configure SMTP for production
5. Set up CI/CD pipeline
6. Deploy to production
7. SSL/HTTPS setup
8. Monitor and fix issues

---

## 📊 Progress Tracking

Use this checklist to track your progress:

- [x] Phase 1: Foundation
- [x] Phase 2: Database & Models
- [x] Phase 3: Authentication
- [x] Phase 4: Blog Module
- [x] Phase 5: Services Module
- [x] Phase 6: Careers Module
- [ ] Phase 7: Media Library
- [ ] Phase 8: Dashboard
- [ ] Phase 9: Testing
- [ ] Phase 10: Deployment

---

## 🎯 Current Focus

**YOU ARE HERE:** Phase 7 - Media Library

**Next Action:** Create media upload middleware and service

---

## 💡 Tips for Success

1. **Build incrementally** - Complete one phase before moving to the next
2. **Test as you go** - Don't wait until the end
3. **Follow the specs** - Refer to API_spec.md and DB_schema.md constantly
4. **Commit often** - Use meaningful commit messages
5. **Document decisions** - Add comments for complex logic
6. **Ask for help** - Refer to documentation when stuck

---

## 📞 Need Help?

Refer to:
- **API_spec.md** - Exact endpoint specifications
- **DB_schema.md** - Database table definitions
- **Coding_guidelines.md** - Code examples and patterns
- **IMPLEMENTATION_STATUS.md** - Current status and next steps

---

**Ready to build!** Start with Phase 2: Create the database models. 🚀
