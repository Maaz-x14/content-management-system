# System Architecture Document
## Morphe Labs Custom CMS

**Version:** 1.0  
**Date:** February 14, 2026  
**Status:** Approved for Implementation

---

## 1. Architecture Overview

### 1.1 Architecture Philosophy
The Morphe Labs CMS follows a **headless architecture** pattern, separating content management (backend) from content presentation (frontend). This approach provides:

- **Flexibility:** Frontend can be rebuilt or redesigned without affecting the CMS
- **Scalability:** Backend and frontend can scale independently
- **Multi-channel delivery:** Content can be consumed by web, mobile, or other platforms
- **Technology independence:** Frontend team can use their preferred stack

### 1.2 Architecture Style
**Layered Three-Tier Architecture with REST API**

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌─────────────────────┐       ┌─────────────────────┐      │
│  │   Admin Panel UI    │       │  Public Frontend    │      │
│  │   (React SPA)       │       │  (External/Separate)│      │
│  └─────────────────────┘       └─────────────────────┘      │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │  HTTPS/REST API            │  HTTPS/REST API
             │                            │
┌────────────┴────────────────────────────┴───────────────────┐
│                    APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Server (Node.js/Express)             │   │
│  │  ┌────────┬────────┬────────┬──────┬──────────────┐  │   │
│  │  │  Auth  │  Blog  │Services│Career│ File Upload  │  │   │
│  │  │ Routes │ Routes │ Routes │Routes│   Handler    │  │   │
│  │  └────────┴────────┴────────┴──────┴──────────────┘  │   │
│  │                                                        │   │
│  │  ┌────────┬────────┬────────┬──────────────────────┐  │   │
│  │  │  Auth  │Content │ User   │   File Management    │  │   │
│  │  │Service │Manager │Manager │       Service        │  │   │
│  │  └────────┴────────┴────────┴──────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │  Database Queries          │  File System I/O
             │                            │
┌────────────┴──────────────┐   ┌─────────┴───────────────────┐
│      DATA LAYER           │   │     STORAGE LAYER           │
│  ┌──────────────────────┐ │   │  ┌────────────────────────┐ │
│  │  PostgreSQL Database │ │   │  │  File Storage          │ │
│  │  - User data         │ │   │  │  - Uploaded images     │ │
│  │  - Content data      │ │   │  │  - Documents/resumes   │ │
│  │  - Application data  │ │   │  │  - Media assets        │ │
│  └──────────────────────┘ │   │  └────────────────────────┘ │
└───────────────────────────┘   └─────────────────────────────┘
```

---

## 2. System Components

### 2.1 Frontend Layer

#### 2.1.1 Admin Panel (React SPA)
**Technology:** React 18+ with TypeScript  
**State Management:** React Context API + React Query for server state  
**UI Framework:** Tailwind CSS + shadcn/ui components  
**Routing:** React Router v6

**Key Modules:**
- **Authentication Module**
  - Login/logout interface
  - Session management
  - Token refresh handling
  
- **Dashboard Module**
  - Overview cards and widgets
  - Activity feed
  - Quick actions
  
- **Content Management Modules**
  - Blog post editor with TipTap (rich text)
  - Service/portfolio manager
  - Career/job listings manager
  
- **Media Library Module**
  - File upload with drag-and-drop
  - Image gallery browser
  - File selection interface
  
- **User Management Module** (Super Admin only)
  - User CRUD operations
  - Role assignment
  - Activity monitoring

**Architecture Pattern:**
```
src/
├── components/           # Reusable UI components
│   ├── common/          # Buttons, inputs, modals
│   ├── layouts/         # Page layouts, navigation
│   └── modules/         # Module-specific components
├── pages/               # Route components
│   ├── Dashboard/
│   ├── Blog/
│   ├── Services/
│   ├── Careers/
│   └── Users/
├── hooks/               # Custom React hooks
├── services/            # API client functions
├── contexts/            # React Context providers
├── utils/               # Helper functions
└── types/               # TypeScript type definitions
```

#### 2.1.2 Public Frontend (External)
**Note:** Not part of CMS build; consumes CMS API  
**Integration:** RESTful API endpoints  
**Authentication:** Not required for public content

---

### 2.2 Application Layer

#### 2.2.1 API Server Architecture
**Technology:** Node.js 20 LTS with Express.js 4.x  
**Language:** TypeScript for type safety  
**API Style:** RESTful with JSON responses

**Middleware Stack:**
```javascript
// Request Processing Order
1. CORS middleware         → Enable cross-origin requests
2. Helmet middleware       → Security headers
3. Rate limiter           → Prevent abuse (express-rate-limit)
4. Body parser            → Parse JSON/form data
5. Cookie parser          → Parse session cookies
6. Morgan logger          → HTTP request logging
7. Authentication         → Verify JWT tokens (where required)
8. Authorization          → Check role permissions (where required)
9. Validation             → Validate request data (express-validator)
10. Route handlers        → Business logic
11. Error handler         → Global error handling
```

**Service Layer Pattern:**
```
src/
├── server.ts                   # Application entry point
├── config/                     # Configuration management
│   ├── database.ts            # DB connection config
│   ├── auth.ts                # JWT secrets, session config
│   └── upload.ts              # File upload settings
├── routes/                     # Route definitions
│   ├── auth.routes.ts
│   ├── blog.routes.ts
│   ├── services.routes.ts
│   ├── careers.routes.ts
│   ├── users.routes.ts
│   └── media.routes.ts
├── controllers/                # Request handlers
│   ├── auth.controller.ts
│   ├── blog.controller.ts
│   └── ...
├── services/                   # Business logic
│   ├── auth.service.ts
│   ├── blog.service.ts
│   └── ...
├── models/                     # Database models (Sequelize/TypeORM)
│   ├── User.model.ts
│   ├── BlogPost.model.ts
│   └── ...
├── middleware/                 # Custom middleware
│   ├── auth.middleware.ts
│   ├── permission.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── utils/                      # Utility functions
│   ├── encryption.ts
│   ├── validation.ts
│   └── email.ts
└── types/                      # TypeScript types/interfaces
```

#### 2.2.2 Core Services

**Authentication Service**
- User login/logout
- JWT token generation and validation
- Password hashing (bcrypt)
- Session management
- Password reset flow

**Content Service**
- CRUD operations for blog posts
- CRUD operations for services/portfolio
- CRUD operations for job listings
- Content search and filtering
- Publishing workflow management

**User Management Service**
- User CRUD operations
- Role assignment
- Activity logging
- Permission checking

**File Management Service**
- File upload handling (Multer)
- Image optimization (Sharp)
- File storage (local or cloud)
- File deletion and cleanup

**Email Service**
- Application notification emails
- Password reset emails
- System alerts
- SMTP integration

---

### 2.3 Data Layer

#### 2.3.1 Database
**Technology:** PostgreSQL 15+  
**ORM:** Sequelize (TypeScript support) or TypeORM  
**Migration Tool:** Sequelize CLI or TypeORM migrations

**Connection Pool Configuration:**
```javascript
{
  pool: {
    max: 10,           // Maximum connections
    min: 2,            // Minimum connections
    acquire: 30000,    // Max time to get connection (ms)
    idle: 10000        // Max idle time before release (ms)
  }
}
```

**Database Design Principles:**
- Third Normal Form (3NF) normalization
- Foreign key constraints for referential integrity
- Indexes on frequently queried columns
- Timestamps on all tables (created_at, updated_at)
- Soft deletes where applicable (deleted_at)

#### 2.3.2 Caching Strategy
**Technology:** Redis (optional for v1.0, recommended for production)

**Caching Layers:**
- **Application-level cache:** Frequently accessed data (user sessions, config)
- **Query cache:** Database query results
- **HTTP cache:** Public API responses (Cache-Control headers)

**Cache Invalidation:**
- Time-based expiration (TTL)
- Event-based invalidation (on content update/delete)
- Manual cache clearing via admin panel

---

### 2.4 Storage Layer

#### 2.4.1 File Storage Options

**Option A: Local File System (Development/Small Scale)**
```
/uploads/
├── images/
│   ├── blog/
│   ├── services/
│   └── careers/
├── documents/
│   └── resumes/
└── temp/            # Temporary upload processing
```

**Option B: Cloud Storage (Production/Scale)**
- **AWS S3** or **DigitalOcean Spaces**
- Presigned URLs for secure access
- CDN integration for fast delivery
- Automated backup and versioning

**File Organization:**
```
bucket/
├── {year}/
│   └── {month}/
│       └── {filename-hash}.{ext}
```

#### 2.4.2 File Upload Flow
```
┌────────────┐
│   Client   │
└──────┬─────┘
       │ 1. Upload request with file
       ▼
┌────────────────┐
│  Multer        │ 2. Validate file type/size
│  Middleware    │
└──────┬─────────┘
       │ 3. File passes validation
       ▼
┌────────────────┐
│  Sharp         │ 4. Optimize/resize image
│  (Images only) │
└──────┬─────────┘
       │ 5. Generate unique filename
       ▼
┌────────────────┐
│  File Storage  │ 6. Save to disk/cloud
│  Service       │
└──────┬─────────┘
       │ 7. Return file URL
       ▼
┌────────────────┐
│  Database      │ 8. Save file metadata
│  (media table) │
└────────────────┘
```

---

## 3. Data Flow Diagrams

### 3.1 Authentication Flow

```
┌───────────┐                                              ┌─────────┐
│  Client   │                                              │Database │
│ (Browser) │                                              └────┬────┘
└─────┬─────┘                                                   │
      │                                                         │
      │ 1. POST /api/auth/login                                │
      │    { email, password }                                 │
      ├────────────────────────────────►┌──────────────┐      │
      │                                  │   Express    │      │
      │                                  │   Server     │      │
      │                                  └──────┬───────┘      │
      │                                         │              │
      │                                         │ 2. Query user by email
      │                                         ├─────────────►│
      │                                         │              │
      │                                         │ 3. User data │
      │                                         │◄─────────────┤
      │                                         │              │
      │                                  4. Verify password    │
      │                                  (bcrypt compare)      │
      │                                         │              │
      │                                  5. Generate JWT       │
      │                                  (sign with secret)    │
      │                                         │              │
      │ 6. Response:                            │              │
      │    { token, user }                      │              │
      │◄────────────────────────────────────────┤              │
      │                                         │              │
      │ 7. Store token in memory/localStorage   │              │
      │                                         │              │
      │ 8. Subsequent requests                  │              │
      │    Header: Authorization: Bearer {token}│              │
      ├────────────────────────────────────────►│              │
      │                                         │              │
      │                                  9. Verify JWT         │
      │                                  (decode & validate)   │
      │                                         │              │
      │                                  10. Extract user ID   │
      │                                         │              │
      │                                         │ 11. Get user │
      │                                         ├─────────────►│
      │                                         │              │
      │                                         │ 12. User data│
      │                                         │◄─────────────┤
      │                                         │              │
      │ 13. Authorized response                 │              │
      │◄────────────────────────────────────────┤              │
      │                                         │              │
```

### 3.2 Content Creation Flow (Blog Post Example)

```
┌──────────┐
│  Editor  │
│  (Admin) │
└────┬─────┘
     │ 1. Create new blog post
     │    Fill in: title, content, category, tags, SEO
     │
     ▼
┌─────────────────┐
│  Rich Text      │ 2. Format content, upload images
│  Editor (React) │
└────┬────────────┘
     │ 3. Auto-save draft every 30 seconds
     │    POST /api/blog/posts
     │    { title, content, status: 'draft', ... }
     │
     ▼
┌──────────────────┐
│  API Server      │ 4. Validate request data
│  (Express)       │    - Check authentication
└────┬─────────────┘    - Verify permissions (role)
     │                  - Validate required fields
     │ 5. Save to database
     │    INSERT INTO blog_posts ...
     │
     ▼
┌──────────────────┐
│  PostgreSQL      │ 6. Store blog post data
│  Database        │    Generate ID, timestamps
└────┬─────────────┘
     │ 7. Return created post with ID
     │
     ▼
┌──────────────────┐
│  API Server      │ 8. Send response
│                  │    { id, title, content, ... }
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│  React Admin     │ 9. Update UI state
│  Panel           │    Show success message
└────┬─────────────┘    Enable publish button
     │
     │ 10. Editor clicks "Publish"
     │     PATCH /api/blog/posts/:id
     │     { status: 'published', published_at: now }
     │
     ▼
┌──────────────────┐
│  API Server      │ 11. Update post status
│                  │     - Set status to 'published'
└────┬─────────────┘     - Set published_at timestamp
     │                   - Clear cache if enabled
     │
     ▼
┌──────────────────┐
│  Database        │ 12. Update record
│                  │     UPDATE blog_posts SET ...
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│  Public API      │ 13. Content now available
│  GET /api/v1/    │     GET /api/v1/blog/posts/:id
│  public/posts    │
└──────────────────┘
```

### 3.3 Public Content Retrieval Flow

```
┌──────────────┐
│ Public User  │
│ (Website)    │
└──────┬───────┘
       │ 1. Request blog posts
       │    GET /api/v1/public/blog/posts?page=1&limit=10
       │
       ▼
┌────────────────┐
│  API Server    │ 2. No authentication required
│  (Express)     │    Apply filters, pagination
└──────┬─────────┘
       │ 3. Check cache (if Redis enabled)
       │    Cache key: blog:posts:page:1:limit:10
       │
       ├─ Cache HIT ──────┐
       │                   │
       │                   ▼
       │            ┌─────────────┐
       │            │Return cached│
       │            │   result    │
       │            └─────────────┘
       │
       └─ Cache MISS ─────┐
                          │
                          ▼
                   ┌────────────────┐
                   │  Query Database│ 4. SELECT posts
                   │                │    WHERE status = 'published'
                   └────┬───────────┘    ORDER BY published_at DESC
                        │                 LIMIT 10 OFFSET 0
                        │
                        ▼
                   ┌────────────────┐
                   │  PostgreSQL    │ 5. Return results
                   │  Database      │
                   └────┬───────────┘
                        │
                        ▼
                   ┌────────────────┐
                   │  Transform data│ 6. Format response
                   │  Add image URLs│    Exclude internal fields
                   │  Serialize     │    Add pagination metadata
                   └────┬───────────┘
                        │
                        ▼
                   ┌────────────────┐
                   │  Cache result  │ 7. Store in Redis (TTL: 5 min)
                   │  (if enabled)  │
                   └────┬───────────┘
                        │
                        ▼
                   ┌────────────────┐
                   │  Send response │ 8. JSON response with headers
                   │  with headers  │    Cache-Control: public, max-age=300
                   └────┬───────────┘
                        │
                        ▼
                   ┌────────────────┐
                   │  Client        │ 9. Render content
                   │  receives data │
                   └────────────────┘
```

---

## 4. Security Architecture

### 4.1 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Network                          │
│  • HTTPS/TLS encryption                                      │
│  • Firewall rules (only ports 80, 443 open)                 │
│  • DDoS protection (Cloudflare/AWS Shield)                  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Layer 2: Application                      │
│  • CORS policy (whitelist allowed origins)                  │
│  • Security headers (Helmet.js)                             │
│    - X-Content-Type-Options: nosniff                        │
│    - X-Frame-Options: DENY                                  │
│    - X-XSS-Protection: 1; mode=block                        │
│    - Strict-Transport-Security: max-age=31536000            │
│  • Rate limiting (express-rate-limit)                       │
│    - Login: 5 attempts per 15 min                           │
│    - API: 100 requests per 15 min                           │
│  • Input validation (express-validator)                     │
│  • Output sanitization (DOMPurify for HTML)                 │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: Authentication                   │
│  • JWT-based authentication                                  │
│  • Secure password hashing (bcrypt, 12 rounds)              │
│  • Session timeout (30 min inactivity)                      │
│  • Token refresh mechanism                                   │
│  • Password strength requirements                           │
│    - Minimum 8 characters                                    │
│    - 1 uppercase, 1 lowercase, 1 number, 1 special char     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Layer 4: Authorization                    │
│  • Role-Based Access Control (RBAC)                         │
│  • Permission middleware on protected routes                │
│  • Resource-level access control                            │
│    - Users can only edit their own content (unless admin)  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Layer 5: Data                             │
│  • SQL injection prevention (parameterized queries)         │
│  • Database connection encryption (SSL/TLS)                 │
│  • Sensitive data encryption at rest                        │
│  • Regular backups (automated, encrypted)                   │
│  • Audit logging (who, what, when)                          │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Layer 6: File Storage                     │
│  • File type validation (whitelist: jpg, png, pdf, etc.)   │
│  • File size limits (5MB images, 2MB documents)             │
│  • Virus scanning (ClamAV)                                  │
│  • Randomized filenames (prevent directory traversal)       │
│  • Separate storage from application code                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Authentication Flow Details

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": 123,
    "email": "user@example.com",
    "role": "editor",
    "iat": 1707955200,      // Issued at
    "exp": 1707958800       // Expires at (1 hour)
  },
  "signature": "..."
}
```

**Token Refresh Strategy:**
- Access token: 1 hour expiry
- Refresh token: 7 days expiry (stored in httpOnly cookie)
- Client detects token expiry → calls refresh endpoint → gets new access token

---

## 5. Deployment Architecture

### 5.1 Development Environment

```
Developer Machine
├── Node.js 20 LTS
├── PostgreSQL 15 (Docker)
├── Redis (Docker, optional)
├── Git
└── VS Code / IDE

Environment Variables (.env.development):
- DATABASE_URL=postgresql://localhost:5432/cms_dev
- JWT_SECRET=dev_secret_key
- NODE_ENV=development
- PORT=5000
```

### 5.2 Production Environment (Recommended)

**Infrastructure:**
```
┌─────────────────────────────────────────────────────────────┐
│                         Load Balancer                        │
│                       (NGINX / AWS ALB)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬──────────────┐
         │                       │              │
    ┌────▼────┐            ┌────▼────┐   ┌────▼────┐
    │ App     │            │ App     │   │ App     │
    │ Server 1│            │ Server 2│   │ Server 3│
    │ (Node)  │            │ (Node)  │   │ (Node)  │
    └────┬────┘            └────┬────┘   └────┬────┘
         │                      │              │
         └──────────┬───────────┴──────────────┘
                    │
         ┌──────────┴──────────────────────┐
         │                                  │
    ┌────▼────────┐                 ┌──────▼──────┐
    │ PostgreSQL  │                 │   Redis     │
    │ (Primary)   │◄───replication─►│   Cache     │
    │             │                 │             │
    └────┬────────┘                 └─────────────┘
         │
    ┌────▼────────┐
    │ PostgreSQL  │
    │ (Replica)   │
    │ (Read-only) │
    └─────────────┘

┌─────────────────────────────────────┐
│       File Storage (S3/Spaces)       │
│  - Images, documents, media          │
│  - CDN for fast delivery             │
└─────────────────────────────────────┘
```

**Deployment Options:**

**Option A: VPS (DigitalOcean, Linode)**
- Single droplet for small scale
- Manual deployment or PM2 ecosystem
- Nginx reverse proxy
- Let's Encrypt SSL

**Option B: Platform-as-a-Service (Heroku, Railway)**
- Simplified deployment (git push)
- Automatic scaling
- Add-ons for database, Redis
- Built-in SSL

**Option C: Container Orchestration (Docker + Kubernetes)**
- Containerized application
- Horizontal scaling
- Self-healing
- Rolling updates

**Recommended for v1.0:** Option A (VPS) or Option B (PaaS) for simplicity

### 5.3 CI/CD Pipeline

```
Developer
    │
    │ 1. git push to main branch
    ▼
┌─────────────────┐
│   GitHub        │
│   Repository    │
└────────┬────────┘
         │ 2. Webhook trigger
         ▼
┌─────────────────┐
│  GitHub Actions │ 3. Run CI pipeline
│  / Jenkins      │    - Install dependencies
└────────┬────────┘    - Run linter (ESLint)
         │             - Run tests (Jest)
         │             - Build TypeScript
         │             - Security scan (npm audit)
         │
         │ 4. All checks pass
         ▼
┌─────────────────┐
│  Build & Deploy │ 5. Create production build
│   Process       │    - Optimize assets
└────────┬────────┘    - Minimize bundle
         │             - Generate source maps
         │
         │ 6. Deploy to staging
         ▼
┌─────────────────┐
│ Staging Server  │ 7. Run smoke tests
│                 │    - API health check
└────────┬────────┘    - Database connection test
         │
         │ 8. Manual approval (optional)
         ▼
┌─────────────────┐
│ Production      │ 9. Rolling deployment
│ Deployment      │    - Update one server at a time
└────────┬────────┘    - Health checks between updates
         │
         │ 10. Deployment complete
         ▼
┌─────────────────┐
│ Monitoring      │ 11. Monitor for errors
│ & Alerts        │     - Error tracking (Sentry)
└─────────────────┘     - Performance monitoring
```

---

## 6. Scalability Considerations

### 6.1 Horizontal Scaling Strategy

**Stateless Application Design:**
- No session data stored in application memory
- JWT tokens for authentication (no server-side session storage)
- Uploaded files stored in centralized storage (S3), not local disk
- Database connection pooling across instances

**Load Balancing:**
- Round-robin or least-connections algorithm
- Health checks to remove unhealthy instances
- Session affinity not required (stateless)

### 6.2 Database Scaling

**Read Replicas:**
- Write operations to primary database
- Read operations distributed to replicas
- Eventual consistency acceptable for most reads

**Query Optimization:**
- Indexes on frequently queried columns
- Materialized views for complex aggregations
- Query result caching with Redis

**Connection Pooling:**
- Reuse database connections
- Limit maximum connections per instance
- Monitor and adjust pool size based on load

### 6.3 Caching Strategy

**Cache Layers:**
1. **Browser Cache:** Static assets (images, CSS, JS)
2. **CDN Cache:** Media files, public content
3. **Application Cache (Redis):** Database query results, session data
4. **Database Query Cache:** Frequently run queries

**Cache Invalidation Events:**
- Content creation/update/deletion → clear related cache keys
- User role change → clear user permission cache
- Scheduled cache refresh (daily at low-traffic hours)

---

## 7. Monitoring & Observability

### 7.1 Logging Strategy

**Log Levels:**
- **ERROR:** Application errors, exceptions
- **WARN:** Deprecated features, unusual conditions
- **INFO:** Significant events (user login, content published)
- **DEBUG:** Detailed information (development only)

**Log Aggregation:**
- Centralized logging (Winston + Elasticsearch/CloudWatch)
- Structured logging (JSON format)
- Request ID for tracing across services

**What to Log:**
```javascript
{
  timestamp: "2026-02-14T10:30:00Z",
  level: "info",
  message: "Blog post published",
  userId: 123,
  postId: 456,
  requestId: "abc-123-def",
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

### 7.2 Metrics & Monitoring

**Application Metrics:**
- Request rate (requests per second)
- Response time (p50, p95, p99 percentiles)
- Error rate (4xx, 5xx responses)
- Active users (concurrent sessions)

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

**Database Metrics:**
- Query execution time
- Connection pool usage
- Slow query log (queries > 1 second)
- Deadlocks and errors

**Monitoring Tools:**
- **Application:** New Relic / Datadog / Prometheus + Grafana
- **Uptime:** UptimeRobot / Pingdom
- **Error Tracking:** Sentry / Rollbar
- **Logs:** Elasticsearch + Kibana / CloudWatch

### 7.3 Alerting

**Critical Alerts (Immediate Response):**
- Application down (health check fails)
- Database connection lost
- Error rate > 5%
- Disk space > 90% full

**Warning Alerts (Monitor & Investigate):**
- Response time > 2 seconds
- Memory usage > 80%
- Unusual traffic patterns
- Failed login attempts spike

---

## 8. Disaster Recovery & Business Continuity

### 8.1 Backup Strategy

**Database Backups:**
- **Frequency:** Daily automated backups at 2 AM
- **Retention:** 30 days
- **Type:** Full backup + incremental
- **Storage:** Encrypted, off-site location (AWS S3 with versioning)
- **Testing:** Monthly restore test

**File Storage Backups:**
- **Frequency:** Real-time sync to backup bucket (if using cloud storage)
- **Retention:** Versioning enabled, 90 days
- **Recovery:** Restore specific files or entire bucket

**Application Code:**
- **Version Control:** Git repository (GitHub/GitLab)
- **Branching Strategy:** main (production), develop, feature branches
- **Tags:** Every production release tagged with version number

### 8.2 Disaster Recovery Plan

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours (last daily backup)

**Recovery Steps:**
1. Identify failure type (application, database, infrastructure)
2. Provision new infrastructure (if necessary)
3. Restore database from latest backup
4. Restore application code from git repository
5. Restore file storage from backup
6. Update DNS (if IP changed)
7. Validate system functionality
8. Communicate status to stakeholders

---

## 9. Technology Stack Summary

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Backend Runtime** | Node.js 20 LTS | JavaScript/TypeScript ecosystem, async I/O, large community |
| **Backend Framework** | Express.js 4.x | Lightweight, flexible, excellent middleware ecosystem |
| **Language** | TypeScript | Type safety, better IDE support, fewer runtime errors |
| **Database** | PostgreSQL 15+ | ACID compliant, robust, excellent for relational data |
| **ORM** | Sequelize / TypeORM | Type-safe database access, migrations, abstracts SQL |
| **Authentication** | JWT (jsonwebtoken) | Stateless, scalable, industry standard |
| **Password Hashing** | bcrypt | Proven security, adjustable cost factor |
| **File Upload** | Multer | Standard for multipart/form-data, middleware-based |
| **Image Processing** | Sharp | Fast, memory-efficient, supports all common formats |
| **Validation** | express-validator | Declarative validation, sanitization, Express integration |
| **Frontend Framework** | React 18+ | Component-based, large ecosystem, team familiarity |
| **Frontend Language** | TypeScript | Type safety for complex state management |
| **State Management** | Context API + React Query | Built-in, server state caching, reduces complexity |
| **UI Framework** | Tailwind CSS + shadcn/ui | Utility-first, consistent design, accessible components |
| **Rich Text Editor** | TipTap | Headless, extensible, modern alternative to TinyMCE |
| **HTTP Client** | Axios | Promise-based, interceptors, request/response transformation |
| **Caching (optional)** | Redis | In-memory, fast, pub/sub support |
| **Email** | Nodemailer | SMTP support, template rendering, attachment handling |
| **Logging** | Winston | Flexible, multiple transports, structured logging |
| **Testing (Backend)** | Jest + Supertest | Unit and integration tests, API endpoint testing |
| **Testing (Frontend)** | Jest + React Testing Library | Component testing, user-centric assertions |
| **Code Quality** | ESLint + Prettier | Consistent code style, catch errors early |
| **CI/CD** | GitHub Actions | Integrated with repo, free for public repos |
| **Deployment** | DigitalOcean/Railway | Simple, affordable, scalable |
| **Monitoring** | Sentry (errors) + UptimeRobot | Error tracking, uptime monitoring, free tiers available |

---

## 10. Architecture Decision Records (ADRs)

### ADR-001: Headless Architecture
**Decision:** Use headless CMS architecture (backend API + separate frontend)  
**Rationale:**
- Flexibility to rebuild/redesign frontend without touching CMS
- Supports multiple frontends (web, mobile, future platforms)
- Clear separation of concerns
- Industry best practice for modern CMSs

**Alternatives Considered:**
- Monolithic (server-side rendering): Less flexible, harder to scale frontend independently
- Static site generator: Limited dynamic content capabilities

### ADR-002: PostgreSQL over MongoDB
**Decision:** Use PostgreSQL relational database  
**Rationale:**
- CMS data is highly relational (users → posts, posts → categories, etc.)
- Need for ACID transactions (data integrity)
- Strong consistency requirements
- Mature ecosystem, excellent performance

**Alternatives Considered:**
- MongoDB: Better for unstructured data, less suitable for relational queries
- MySQL: Similar to PostgreSQL, but Postgres has better JSON support and features

### ADR-003: JWT Authentication
**Decision:** Use JWT tokens for authentication  
**Rationale:**
- Stateless (no server-side session storage required)
- Scales horizontally easily
- Industry standard for API authentication
- Can include user role in token payload

**Alternatives Considered:**
- Session cookies: Requires server-side storage, harder to scale
- OAuth: Overkill for internal CMS, adds complexity

### ADR-004: TypeScript over JavaScript
**Decision:** Use TypeScript for both backend and frontend  
**Rationale:**
- Type safety reduces bugs in production
- Better IDE support (autocomplete, refactoring)
- Self-documenting code (types as documentation)
- Small learning curve for JavaScript developers

**Alternatives Considered:**
- JavaScript: Faster initial development, but more runtime errors

---

## Appendix A: API Architecture Patterns

### REST API Design Principles

**Resource Naming:**
- Use nouns, not verbs: `/posts` not `/getPosts`
- Plural resources: `/users`, `/posts`, `/jobs`
- Hierarchical relationships: `/posts/:id/comments`

**HTTP Methods:**
- GET: Retrieve resources (idempotent, safe)
- POST: Create resources (not idempotent)
- PUT: Full update (idempotent)
- PATCH: Partial update (idempotent)
- DELETE: Remove resources (idempotent)

**Response Codes:**
- 200 OK: Successful GET/PUT/PATCH
- 201 Created: Successful POST
- 204 No Content: Successful DELETE
- 400 Bad Request: Invalid input
- 401 Unauthorized: Missing/invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource doesn't exist
- 422 Unprocessable Entity: Validation errors
- 500 Internal Server Error: Server error

**Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "metadata": {
    "timestamp": "2026-02-14T10:30:00Z",
    "version": "v1"
  }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "metadata": {
    "timestamp": "2026-02-14T10:30:00Z",
    "requestId": "abc-123-def"
  }
}
```

---

**End of Architecture Document**