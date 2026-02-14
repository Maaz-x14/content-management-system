# API Specification
## Morphe Labs Custom CMS

**Version:** 1.0  
**Base URL:** `https://api.morphelabs.com` (Production)  
**Base URL:** `http://localhost:5000` (Development)  
**API Version:** `/api/v1`

---

## 1. API Overview

### 1.1 General Information

**Protocol:** HTTPS (required in production)  
**Data Format:** JSON  
**Authentication:** JWT (JSON Web Tokens)  
**Character Encoding:** UTF-8

### 1.2 Common Headers

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}    // Required for protected routes
Accept: application/json
```

**Response Headers:**
```
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707955200
```

### 1.3 Rate Limiting

| Endpoint Type | Rate Limit |
|--------------|------------|
| Authentication | 5 requests per 15 minutes per IP |
| Public API | 100 requests per 15 minutes per IP |
| Authenticated API | 1000 requests per hour per user |

**Rate Limit Exceeded Response (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900
  }
}
```

### 1.4 Pagination

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (prefix with `-` for descending, e.g., `-created_at`)

**Paginated Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 2. Authentication API

### 2.1 User Login

**Endpoint:** `POST /api/v1/auth/login`  
**Authentication:** None (public)  
**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 chars)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "email": "admin@morphelabs.com",
      "fullName": "John Doe",
      "role": "super_admin",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  },
  "message": "Login successful"
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Too many login attempts. Please try again in 15 minutes.",
    "retryAfter": 900
  }
}
```

---

### 2.2 Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`  
**Authentication:** Refresh token (in cookie or body)  
**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "string (required if not in cookie)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  },
  "message": "Token refreshed successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Invalid or expired refresh token"
  }
}
```

---

### 2.3 Logout

**Endpoint:** `POST /api/v1/auth/logout`  
**Authentication:** Required (JWT)  
**Description:** Invalidate current session

**Request Body:** None (token in Authorization header)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 2.4 Request Password Reset

**Endpoint:** `POST /api/v1/auth/forgot-password`  
**Authentication:** None (public)  
**Description:** Send password reset email

**Request Body:**
```json
{
  "email": "string (required, email format)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent if account exists"
}
```

**Note:** Returns same response regardless of whether email exists (security best practice)

---

### 2.5 Reset Password

**Endpoint:** `POST /api/v1/auth/reset-password`  
**Authentication:** None (uses reset token)  
**Description:** Reset password using token from email

**Request Body:**
```json
{
  "token": "string (required, from email link)",
  "newPassword": "string (required, min 8 chars)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired reset token"
  }
}
```

---

### 2.6 Get Current User

**Endpoint:** `GET /api/v1/auth/me`  
**Authentication:** Required (JWT)  
**Description:** Get authenticated user's profile

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@morphelabs.com",
    "fullName": "John Doe",
    "role": "super_admin",
    "isActive": true,
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-02-14T10:00:00Z"
  }
}
```

---

## 3. Blog Posts API

### 3.1 Get All Blog Posts (Admin)

**Endpoint:** `GET /api/v1/blog/posts`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Get all blog posts with filters (includes drafts)

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10, max: 100)
- `status`: string (draft, published, scheduled, archived)
- `category`: number (category ID)
- `author`: number (user ID)
- `search`: string (search in title and content)
- `sort`: string (options: -created_at, created_at, -published_at, title)

**Example Request:**
```
GET /api/v1/blog/posts?page=1&limit=10&status=published&sort=-published_at
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Getting Started with React",
      "slug": "getting-started-with-react",
      "content": "<p>Full HTML content here...</p>",
      "excerpt": "Learn the basics of React...",
      "status": "published",
      "featuredImage": "https://cdn.morphelabs.com/images/2026/02/abc123.jpg",
      "publishedAt": "2026-02-14T10:00:00Z",
      "author": {
        "id": 2,
        "fullName": "Jane Smith",
        "email": "jane@morphelabs.com"
      },
      "category": {
        "id": 1,
        "name": "Web Development",
        "slug": "web-development"
      },
      "tags": [
        {
          "id": 1,
          "name": "React",
          "slug": "react"
        },
        {
          "id": 2,
          "name": "JavaScript",
          "slug": "javascript"
        }
      ],
      "seo": {
        "metaTitle": "Getting Started with React - Morphe Labs",
        "metaDescription": "Learn the basics of React framework...",
        "keywords": "react, javascript, tutorial"
      },
      "createdAt": "2026-02-10T09:00:00Z",
      "updatedAt": "2026-02-14T08:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3.2 Get Single Blog Post (Admin)

**Endpoint:** `GET /api/v1/blog/posts/:id`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Get single post by ID (includes drafts)

**Path Parameters:**
- `id`: number (post ID)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Getting Started with React",
    "slug": "getting-started-with-react",
    "content": "<p>Full HTML content...</p>",
    "excerpt": "Learn the basics...",
    "status": "published",
    "featuredImage": "https://cdn.morphelabs.com/images/2026/02/abc123.jpg",
    "publishedAt": "2026-02-14T10:00:00Z",
    "scheduledFor": null,
    "author": {
      "id": 2,
      "fullName": "Jane Smith"
    },
    "category": {
      "id": 1,
      "name": "Web Development",
      "slug": "web-development"
    },
    "tags": [
      {"id": 1, "name": "React", "slug": "react"}
    ],
    "seo": {
      "metaTitle": "Getting Started with React",
      "metaDescription": "Learn the basics...",
      "keywords": "react, javascript",
      "canonicalUrl": null
    },
    "createdAt": "2026-02-10T09:00:00Z",
    "updatedAt": "2026-02-14T08:30:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Blog post not found"
  }
}
```

---

### 3.3 Create Blog Post

**Endpoint:** `POST /api/v1/blog/posts`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Create new blog post

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "slug": "string (optional, auto-generated from title)",
  "content": "string (required, HTML allowed)",
  "excerpt": "string (optional, max 300 chars)",
  "status": "string (enum: draft, published, scheduled, default: draft)",
  "featuredImage": "string (optional, URL or file ID)",
  "publishedAt": "string (ISO 8601, required if status=published)",
  "scheduledFor": "string (ISO 8601, required if status=scheduled)",
  "categoryId": "number (required)",
  "tagIds": "array of numbers (optional)",
  "seo": {
    "metaTitle": "string (optional, max 60 chars)",
    "metaDescription": "string (optional, max 160 chars)",
    "keywords": "string (optional, comma-separated)",
    "canonicalUrl": "string (optional, URL format)"
  }
}
```

**Example Request:**
```json
{
  "title": "Introduction to TypeScript",
  "content": "<p>TypeScript is a typed superset of JavaScript...</p>",
  "excerpt": "Learn TypeScript basics in this comprehensive guide.",
  "status": "draft",
  "categoryId": 1,
  "tagIds": [1, 3, 5],
  "seo": {
    "metaTitle": "Introduction to TypeScript",
    "metaDescription": "Learn TypeScript basics in this guide",
    "keywords": "typescript, javascript, programming"
  }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 46,
    "title": "Introduction to TypeScript",
    "slug": "introduction-to-typescript",
    "status": "draft",
    "author": {
      "id": 2,
      "fullName": "Jane Smith"
    },
    "createdAt": "2026-02-14T14:30:00Z",
    "updatedAt": "2026-02-14T14:30:00Z"
  },
  "message": "Blog post created successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      },
      {
        "field": "categoryId",
        "message": "Category ID must be a valid number"
      }
    ]
  }
}
```

---

### 3.4 Update Blog Post

**Endpoint:** `PATCH /api/v1/blog/posts/:id`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Update existing blog post (partial update)

**Path Parameters:**
- `id`: number (post ID)

**Request Body:** (all fields optional)
```json
{
  "title": "string",
  "slug": "string",
  "content": "string",
  "excerpt": "string",
  "status": "string (enum: draft, published, scheduled, archived)",
  "featuredImage": "string",
  "publishedAt": "string (ISO 8601)",
  "scheduledFor": "string (ISO 8601)",
  "categoryId": "number",
  "tagIds": "array of numbers",
  "seo": {
    "metaTitle": "string",
    "metaDescription": "string",
    "keywords": "string",
    "canonicalUrl": "string"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "updatedAt": "2026-02-14T15:00:00Z"
  },
  "message": "Blog post updated successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to edit this post"
  }
}
```

---

### 3.5 Delete Blog Post

**Endpoint:** `DELETE /api/v1/blog/posts/:id`  
**Authentication:** Required (Editor own posts, Super Admin all posts)  
**Description:** Delete blog post (soft delete)

**Path Parameters:**
- `id`: number (post ID)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog post deleted successfully"
}
```

---

### 3.6 Get Categories

**Endpoint:** `GET /api/v1/blog/categories`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Get all blog categories

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Web Development",
      "slug": "web-development",
      "description": "Articles about web development",
      "postCount": 15,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

### 3.7 Create Category

**Endpoint:** `POST /api/v1/blog/categories`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Create new category

**Request Body:**
```json
{
  "name": "string (required, max 100 chars)",
  "slug": "string (optional, auto-generated)",
  "description": "string (optional, max 500 chars)"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "Mobile Development",
    "slug": "mobile-development",
    "createdAt": "2026-02-14T15:30:00Z"
  },
  "message": "Category created successfully"
}
```

---

### 3.8 Get Tags

**Endpoint:** `GET /api/v1/blog/tags`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Get all tags with autocomplete support

**Query Parameters:**
- `search`: string (optional, search tag names)
- `limit`: number (default: 20)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "React",
      "slug": "react",
      "postCount": 8
    }
  ]
}
```

---

## 4. Services/Portfolio API

### 4.1 Get All Services

**Endpoint:** `GET /api/v1/services`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Get all service/portfolio projects

**Query Parameters:**
- `page`: number
- `limit`: number
- `category`: string (filter by service type)
- `technology`: string (filter by technology)
- `industry`: string (filter by industry)
- `featured`: boolean (only featured projects)
- `status`: string (completed, ongoing, archived)
- `sort`: string (-date, title)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "E-Commerce Platform Redesign",
      "slug": "ecommerce-platform-redesign",
      "description": "<p>Full description...</p>",
      "clientName": "ABC Corporation",
      "projectUrl": "https://example.com",
      "projectDate": "2025-12-15",
      "status": "completed",
      "featured": true,
      "category": "Web Development",
      "technologies": ["React", "Node.js", "PostgreSQL"],
      "industry": "E-commerce",
      "images": [
        {
          "id": 1,
          "url": "https://cdn.morphelabs.com/images/projects/project1-hero.jpg",
          "isPrimary": true,
          "caption": "Homepage design",
          "order": 1
        }
      ],
      "caseStudy": {
        "challenge": "The client needed...",
        "solution": "We implemented...",
        "results": "Increased conversion by 35%..."
      },
      "createdAt": "2026-01-20T10:00:00Z",
      "updatedAt": "2026-02-05T14:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 4.2 Get Single Service

**Endpoint:** `GET /api/v1/services/:id`  
**Authentication:** Required (Editor, Super Admin)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "E-Commerce Platform Redesign",
    "slug": "ecommerce-platform-redesign",
    "description": "<p>Full HTML description...</p>",
    "clientName": "ABC Corporation",
    "projectUrl": "https://example.com",
    "projectDate": "2025-12-15",
    "projectDuration": "3 months",
    "status": "completed",
    "featured": true,
    "category": "Web Development",
    "technologies": ["React", "Node.js", "PostgreSQL", "AWS"],
    "industry": "E-commerce",
    "teamMembers": [
      {"id": 2, "name": "John Doe", "role": "Lead Developer"}
    ],
    "images": [
      {
        "id": 1,
        "url": "https://cdn.morphelabs.com/images/projects/img1.jpg",
        "isPrimary": true,
        "caption": "Homepage design",
        "order": 1
      }
    ],
    "caseStudy": {
      "challenge": "<p>The client needed to modernize...</p>",
      "solution": "<p>We implemented a headless architecture...</p>",
      "results": "<p>Increased conversion by 35%, page load time reduced...</p>",
      "metrics": [
        {"label": "Conversion Rate", "value": "+35%"},
        {"label": "Page Load Time", "value": "-60%"}
      ]
    },
    "createdAt": "2026-01-20T10:00:00Z",
    "updatedAt": "2026-02-05T14:00:00Z"
  }
}
```

---

### 4.3 Create Service

**Endpoint:** `POST /api/v1/services`  
**Authentication:** Required (Editor, Super Admin)

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "slug": "string (optional, auto-generated)",
  "description": "string (required, HTML allowed)",
  "clientName": "string (optional, max 100 chars)",
  "projectUrl": "string (optional, URL format)",
  "projectDate": "string (ISO 8601 date)",
  "projectDuration": "string (optional, e.g., '3 months')",
  "status": "string (enum: completed, ongoing, archived, default: ongoing)",
  "featured": "boolean (default: false)",
  "category": "string (required, e.g., 'Web Development')",
  "technologies": "array of strings (optional)",
  "industry": "string (optional)",
  "teamMembers": "array of user IDs (optional)",
  "images": "array of image objects (optional)",
  "caseStudy": {
    "challenge": "string (optional, HTML)",
    "solution": "string (optional, HTML)",
    "results": "string (optional, HTML)",
    "metrics": "array of {label, value} (optional)"
  }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "title": "Mobile Banking App",
    "slug": "mobile-banking-app",
    "createdAt": "2026-02-14T16:00:00Z"
  },
  "message": "Service created successfully"
}
```

---

### 4.4 Update Service

**Endpoint:** `PATCH /api/v1/services/:id`  
**Authentication:** Required (Editor, Super Admin)

**Request Body:** (all fields optional, same as create)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Title",
    "updatedAt": "2026-02-14T16:30:00Z"
  },
  "message": "Service updated successfully"
}
```

---

### 4.5 Delete Service

**Endpoint:** `DELETE /api/v1/services/:id`  
**Authentication:** Required (Super Admin)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## 5. Careers/Jobs API

### 5.1 Get All Jobs

**Endpoint:** `GET /api/v1/careers/jobs`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Get all job listings

**Query Parameters:**
- `page`: number
- `limit`: number
- `department`: string
- `location`: string
- `employmentType`: string (full-time, part-time, contract, internship)
- `status`: string (active, inactive)
- `sort`: string (-created_at, title)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Senior Full-Stack Developer",
      "slug": "senior-full-stack-developer",
      "department": "Engineering",
      "location": {
        "type": "hybrid",
        "city": "San Francisco",
        "region": "CA"
      },
      "employmentType": "full-time",
      "description": "<p>We are looking for...</p>",
      "responsibilities": [
        "Build scalable web applications",
        "Mentor junior developers"
      ],
      "qualificationsRequired": [
        "5+ years experience with React and Node.js",
        "Strong CS fundamentals"
      ],
      "qualificationsPreferred": [
        "Experience with TypeScript",
        "Open source contributions"
      ],
      "salaryRange": {
        "min": 120000,
        "max": 160000,
        "currency": "USD",
        "visible": true
      },
      "applicationDeadline": "2026-03-31",
      "status": "active",
      "applicationsCount": 23,
      "createdAt": "2026-02-01T09:00:00Z",
      "updatedAt": "2026-02-14T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 5.2 Get Single Job

**Endpoint:** `GET /api/v1/careers/jobs/:id`  
**Authentication:** Required (Editor, Super Admin)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Senior Full-Stack Developer",
    "slug": "senior-full-stack-developer",
    "department": "Engineering",
    "location": {
      "type": "hybrid",
      "city": "San Francisco",
      "region": "CA",
      "remotePolicy": "3 days in office, 2 days remote"
    },
    "employmentType": "full-time",
    "description": "<p>Full job description...</p>",
    "responsibilities": [...],
    "qualificationsRequired": [...],
    "qualificationsPreferred": [...],
    "benefits": [
      "Health insurance",
      "401(k) matching",
      "Unlimited PTO"
    ],
    "salaryRange": {
      "min": 120000,
      "max": 160000,
      "currency": "USD",
      "visible": true
    },
    "applicationDeadline": "2026-03-31",
    "status": "active",
    "applicationsCount": 23,
    "internalNotes": "Prioritize candidates with fintech experience",
    "createdAt": "2026-02-01T09:00:00Z",
    "updatedAt": "2026-02-14T10:00:00Z"
  }
}
```

---

### 5.3 Create Job

**Endpoint:** `POST /api/v1/careers/jobs`  
**Authentication:** Required (Editor, Super Admin)

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "slug": "string (optional, auto-generated)",
  "department": "string (required, max 100 chars)",
  "location": {
    "type": "string (enum: remote, on-site, hybrid, required)",
    "city": "string (optional if remote)",
    "region": "string (optional)",
    "remotePolicy": "string (optional)"
  },
  "employmentType": "string (enum: full-time, part-time, contract, internship, required)",
  "description": "string (required, HTML allowed)",
  "responsibilities": "array of strings (required)",
  "qualificationsRequired": "array of strings (required)",
  "qualificationsPreferred": "array of strings (optional)",
  "benefits": "array of strings (optional)",
  "salaryRange": {
    "min": "number (optional)",
    "max": "number (optional)",
    "currency": "string (default: USD)",
    "visible": "boolean (default: false)"
  },
  "applicationDeadline": "string (ISO 8601 date, optional)",
  "status": "string (enum: active, inactive, default: active)",
  "internalNotes": "string (optional, not visible to applicants)"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "title": "Frontend Developer",
    "slug": "frontend-developer",
    "createdAt": "2026-02-14T17:00:00Z"
  },
  "message": "Job created successfully"
}
```

---

### 5.4 Update Job

**Endpoint:** `PATCH /api/v1/careers/jobs/:id`  
**Authentication:** Required (Editor, Super Admin)

**Request Body:** (all fields optional, same as create)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Job Title",
    "updatedAt": "2026-02-14T17:30:00Z"
  },
  "message": "Job updated successfully"
}
```

---

### 5.5 Delete Job

**Endpoint:** `DELETE /api/v1/careers/jobs/:id`  
**Authentication:** Required (Super Admin)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

### 5.6 Get Job Applications

**Endpoint:** `GET /api/v1/careers/jobs/:jobId/applications`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Get all applications for a specific job

**Query Parameters:**
- `page`: number
- `limit`: number
- `status`: string (new, reviewing, interview, rejected, hired)
- `sort`: string (-created_at, name)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "applicantName": "John Smith",
      "applicantEmail": "john.smith@email.com",
      "applicantPhone": "+1-555-0123",
      "resumeUrl": "https://storage.morphelabs.com/resumes/abc123.pdf",
      "coverLetter": "I am excited to apply...",
      "status": "new",
      "notes": "",
      "appliedAt": "2026-02-10T14:30:00Z",
      "job": {
        "id": 1,
        "title": "Senior Full-Stack Developer"
      }
    }
  ],
  "pagination": { ... }
}
```

---

### 5.7 Get Single Application

**Endpoint:** `GET /api/v1/careers/applications/:id`  
**Authentication:** Required (Editor, Super Admin)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "applicantName": "John Smith",
    "applicantEmail": "john.smith@email.com",
    "applicantPhone": "+1-555-0123",
    "resumeUrl": "https://storage.morphelabs.com/resumes/abc123.pdf",
    "resumeFilename": "john_smith_resume.pdf",
    "coverLetter": "Full cover letter text...",
    "linkedinUrl": "https://linkedin.com/in/johnsmith",
    "portfolioUrl": "https://johnsmith.dev",
    "status": "reviewing",
    "notes": "Strong candidate, schedule interview",
    "appliedAt": "2026-02-10T14:30:00Z",
    "job": {
      "id": 1,
      "title": "Senior Full-Stack Developer",
      "department": "Engineering"
    }
  }
}
```

---

### 5.8 Update Application Status

**Endpoint:** `PATCH /api/v1/careers/applications/:id`  
**Authentication:** Required (Editor, Super Admin)

**Request Body:**
```json
{
  "status": "string (enum: new, reviewing, interview, rejected, hired)",
  "notes": "string (optional)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "interview",
    "notes": "Scheduled for next week"
  },
  "message": "Application updated successfully"
}
```

---

### 5.9 Export Applications

**Endpoint:** `GET /api/v1/careers/jobs/:jobId/applications/export`  
**Authentication:** Required (Editor, Super Admin)  
**Description:** Export applications to CSV

**Query Parameters:**
- `status`: string (optional, filter by status)

**Success Response (200 OK):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="applications-job-1-2026-02-14.csv"

ID,Name,Email,Phone,Status,Applied At,Resume URL
1,John Smith,john@email.com,+1-555-0123,new,2026-02-10T14:30:00Z,https://...
```

---

## 6. User Management API

### 6.1 Get All Users

**Endpoint:** `GET /api/v1/users`  
**Authentication:** Required (Super Admin only)  
**Description:** Get all users

**Query Parameters:**
- `page`: number
- `limit`: number
- `role`: string (super_admin, editor, viewer)
- `isActive`: boolean
- `search`: string (search by name or email)
- `sort`: string (-created_at, name, email)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@morphelabs.com",
      "fullName": "John Doe",
      "role": "super_admin",
      "isActive": true,
      "lastLogin": "2026-02-14T09:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-02-14T09:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 6.2 Get Single User

**Endpoint:** `GET /api/v1/users/:id`  
**Authentication:** Required (Super Admin, or own profile)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "editor@morphelabs.com",
    "fullName": "Jane Smith",
    "role": "editor",
    "isActive": true,
    "lastLogin": "2026-02-14T08:30:00Z",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-02-14T08:30:00Z"
  }
}
```

---

### 6.3 Create User

**Endpoint:** `POST /api/v1/users`  
**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "email": "string (required, email format, unique)",
  "password": "string (required, min 8 chars)",
  "fullName": "string (required, max 255 chars)",
  "role": "string (enum: super_admin, editor, viewer, default: viewer)",
  "isActive": "boolean (default: true)"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "email": "newuser@morphelabs.com",
    "fullName": "New User",
    "role": "editor",
    "createdAt": "2026-02-14T18:00:00Z"
  },
  "message": "User created successfully"
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "User with this email already exists"
  }
}
```

---

### 6.4 Update User

**Endpoint:** `PATCH /api/v1/users/:id`  
**Authentication:** Required (Super Admin, or own profile for non-role fields)

**Request Body:** (all fields optional)
```json
{
  "email": "string (email format)",
  "fullName": "string",
  "role": "string (Super Admin only)",
  "isActive": "boolean (Super Admin only)",
  "password": "string (min 8 chars, requires currentPassword)"
}
```

**To change password (own account):**
```json
{
  "currentPassword": "string (required)",
  "password": "string (required, new password)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "updated@morphelabs.com",
    "fullName": "Jane Smith",
    "updatedAt": "2026-02-14T18:30:00Z"
  },
  "message": "User updated successfully"
}
```

---

### 6.5 Delete User

**Endpoint:** `DELETE /api/v1/users/:id`  
**Authentication:** Required (Super Admin only)  
**Description:** Deactivate user (soft delete)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_SELF",
    "message": "Cannot delete your own account"
  }
}
```

---

## 7. Media/Files API

### 7.1 Upload File

**Endpoint:** `POST /api/v1/media/upload`  
**Authentication:** Required (Editor, Super Admin)  
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `file`: File (required, max 5MB for images, 2MB for documents)
- `type`: string (optional, enum: image, document)
- `altText`: string (optional, for images)

**Allowed File Types:**
- **Images:** .jpg, .jpeg, .png, .webp, .gif
- **Documents:** .pdf, .doc, .docx

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "filename": "uploaded-image.jpg",
    "originalName": "my-image.jpg",
    "url": "https://cdn.morphelabs.com/images/2026/02/abc123def.jpg",
    "type": "image",
    "size": 245678,
    "mimeType": "image/jpeg",
    "altText": "Product screenshot",
    "uploadedBy": {
      "id": 2,
      "fullName": "Jane Smith"
    },
    "createdAt": "2026-02-14T19:00:00Z"
  },
  "message": "File uploaded successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File type not allowed. Allowed types: jpg, png, pdf, doc, docx"
  }
}
```

**Error Response (413 Payload Too Large):**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum allowed (5MB for images, 2MB for documents)"
  }
}
```

---

### 7.2 Get All Files

**Endpoint:** `GET /api/v1/media`  
**Authentication:** Required (Editor, Super Admin)

**Query Parameters:**
- `page`: number
- `limit`: number
- `type`: string (image, document)
- `search`: string (search by filename)
- `sort`: string (-created_at, filename, size)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "filename": "hero-image.jpg",
      "url": "https://cdn.morphelabs.com/images/2026/02/abc123.jpg",
      "thumbnailUrl": "https://cdn.morphelabs.com/images/2026/02/abc123-thumb.jpg",
      "type": "image",
      "size": 245678,
      "mimeType": "image/jpeg",
      "altText": "Hero image",
      "uploadedBy": {
        "id": 2,
        "fullName": "Jane Smith"
      },
      "createdAt": "2026-02-14T19:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 7.3 Get Single File

**Endpoint:** `GET /api/v1/media/:id`  
**Authentication:** Required (Editor, Super Admin)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "filename": "hero-image.jpg",
    "originalName": "company-hero.jpg",
    "url": "https://cdn.morphelabs.com/images/2026/02/abc123.jpg",
    "type": "image",
    "size": 245678,
    "mimeType": "image/jpeg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "altText": "Hero image",
    "uploadedBy": {
      "id": 2,
      "fullName": "Jane Smith"
    },
    "usedIn": [
      {
        "type": "blog_post",
        "id": 5,
        "title": "Company Announcement"
      }
    ],
    "createdAt": "2026-02-14T19:00:00Z"
  }
}
```

---

### 7.4 Update File Metadata

**Endpoint:** `PATCH /api/v1/media/:id`  
**Authentication:** Required (Editor, Super Admin)

**Request Body:**
```json
{
  "altText": "string (optional)",
  "filename": "string (optional, changes display name only)"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "altText": "Updated alt text",
    "updatedAt": "2026-02-14T19:30:00Z"
  },
  "message": "File metadata updated successfully"
}
```

---

### 7.5 Delete File

**Endpoint:** `DELETE /api/v1/media/:id`  
**Authentication:** Required (Editor, Super Admin)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "code": "FILE_IN_USE",
    "message": "Cannot delete file. It is currently used in 3 blog posts.",
    "details": [
      {"type": "blog_post", "id": 5, "title": "Article Title"}
    ]
  }
}
```

---

## 8. Public API (No Authentication Required)

### 8.1 Get Published Blog Posts

**Endpoint:** `GET /api/v1/public/blog/posts`  
**Authentication:** None (public)  
**Description:** Get published blog posts for public website

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10, max: 50)
- `category`: string (category slug)
- `tag`: string (tag slug)
- `search`: string
- `sort`: string (-published_at, title)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Getting Started with React",
      "slug": "getting-started-with-react",
      "excerpt": "Learn the basics of React...",
      "featuredImage": "https://cdn.morphelabs.com/images/abc123.jpg",
      "publishedAt": "2026-02-14T10:00:00Z",
      "author": {
        "name": "Jane Smith"
      },
      "category": {
        "name": "Web Development",
        "slug": "web-development"
      },
      "tags": [
        {"name": "React", "slug": "react"}
      ],
      "readTime": 5
    }
  ],
  "pagination": { ... }
}
```

---

### 8.2 Get Single Published Blog Post

**Endpoint:** `GET /api/v1/public/blog/posts/:slug`  
**Authentication:** None (public)

**Path Parameters:**
- `slug`: string (post slug)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Getting Started with React",
    "slug": "getting-started-with-react",
    "content": "<p>Full HTML content...</p>",
    "excerpt": "Learn the basics...",
    "featuredImage": "https://cdn.morphelabs.com/images/abc123.jpg",
    "publishedAt": "2026-02-14T10:00:00Z",
    "author": {
      "name": "Jane Smith"
    },
    "category": {
      "name": "Web Development",
      "slug": "web-development"
    },
    "tags": [
      {"name": "React", "slug": "react"}
    ],
    "seo": {
      "metaTitle": "Getting Started with React - Morphe Labs",
      "metaDescription": "Learn the basics of React framework",
      "keywords": "react, javascript, tutorial"
    },
    "readTime": 5
  }
}
```

---

### 8.3 Get Published Services

**Endpoint:** `GET /api/v1/public/services`  
**Authentication:** None (public)

**Query Parameters:**
- `page`: number
- `limit`: number
- `category`: string
- `technology`: string
- `featured`: boolean

**Success Response:** (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "E-Commerce Platform Redesign",
      "slug": "ecommerce-platform-redesign",
      "description": "<p>Project description...</p>",
      "category": "Web Development",
      "technologies": ["React", "Node.js"],
      "featured": true,
      "primaryImage": "https://cdn.morphelabs.com/images/project1.jpg",
      "caseStudy": {
        "challenge": "Brief challenge...",
        "solution": "Brief solution...",
        "results": "Brief results..."
      }
    }
  ],
  "pagination": { ... }
}
```

---

### 8.4 Get Active Job Listings

**Endpoint:** `GET /api/v1/public/careers/jobs`  
**Authentication:** None (public)

**Query Parameters:**
- `page`: number
- `limit`: number
- `department`: string
- `location`: string
- `employmentType`: string

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Senior Full-Stack Developer",
      "slug": "senior-full-stack-developer",
      "department": "Engineering",
      "location": {
        "type": "hybrid",
        "city": "San Francisco"
      },
      "employmentType": "full-time",
      "excerpt": "We are looking for an experienced developer...",
      "applicationDeadline": "2026-03-31"
    }
  ],
  "pagination": { ... }
}
```

---

### 8.5 Get Single Job Listing

**Endpoint:** `GET /api/v1/public/careers/jobs/:slug`  
**Authentication:** None (public)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Senior Full-Stack Developer",
    "slug": "senior-full-stack-developer",
    "department": "Engineering",
    "location": {
      "type": "hybrid",
      "city": "San Francisco",
      "region": "CA"
    },
    "employmentType": "full-time",
    "description": "<p>Full description...</p>",
    "responsibilities": [...],
    "qualificationsRequired": [...],
    "qualificationsPreferred": [...],
    "benefits": [...],
    "salaryRange": {
      "min": 120000,
      "max": 160000,
      "currency": "USD"
    },
    "applicationDeadline": "2026-03-31"
  }
}
```

---

### 8.6 Submit Job Application

**Endpoint:** `POST /api/v1/public/careers/jobs/:jobId/apply`  
**Authentication:** None (public)  
**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `applicantName`: string (required, max 255 chars)
- `applicantEmail`: string (required, email format)
- `applicantPhone`: string (required, phone format)
- `resume`: File (required, PDF/DOC/DOCX, max 2MB)
- `coverLetter`: string (optional, max 5000 chars)
- `linkedinUrl`: string (optional, URL format)
- `portfolioUrl`: string (optional, URL format)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Application submitted successfully. We'll review your application and get back to you soon."
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "applicantEmail",
        "message": "Valid email is required"
      },
      {
        "field": "resume",
        "message": "Resume file is required"
      }
    ]
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "Job listing not found or no longer accepting applications"
  }
}
```

---

## 9. Error Codes Reference

| Error Code | HTTP Status | Description |
|-----------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `POST_NOT_FOUND` | 404 | Blog post not found |
| `USER_NOT_FOUND` | 404 | User not found |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `SLUG_EXISTS` | 409 | URL slug already in use |
| `FILE_IN_USE` | 409 | Cannot delete file (used in content) |
| `PAYLOAD_TOO_LARGE` | 413 | Request body too large |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## 10. Webhook Events (Future Enhancement)

Webhooks allow external systems to be notified of CMS events. This feature is planned for v2.0.

**Planned Events:**
- `blog.post.published`
- `blog.post.updated`
- `blog.post.deleted`
- `service.created`
- `service.updated`
- `job.created`
- `job.application.received`

---

**End of API Specification**