# API Testing Guide - Morphe Labs CMS

## Server Information

- **Base URL:** `http://localhost:5001/api/v1`
- **Environment:** Development
- **Port:** 5001

## Default Credentials

```
Email: admin@morphelabs.com
Password: Admin@123456
Role: Super Admin
```

---

## Authentication Endpoints

### 1. Login

**Endpoint:** `POST /api/v1/auth/login`

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@morphelabs.com",
    "password": "Admin@123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@morphelabs.com",
      "fullName": "System Administrator",
      "role": "super-admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Request:**
```bash
curl http://localhost:5001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@morphelabs.com",
    "fullName": "System Administrator",
    "role": {
      "id": 1,
      "name": "Super Admin",
      "slug": "super-admin"
    },
    "isActive": true,
    "lastLogin": "2026-02-14T07:55:53.887Z",
    "createdAt": "2026-02-14T07:00:00.000Z"
  }
}
```

---

### 3. Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Forgot Password

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@morphelabs.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

### 5. Reset Password

**Endpoint:** `POST /api/v1/auth/reset-password`

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_EMAIL",
    "newPassword": "NewPassword@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

---

### 6. Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## User Management Endpoints

### 1. Get All Roles

**Endpoint:** `GET /api/v1/users/roles`

**Request:**
```bash
curl http://localhost:5001/api/v1/users/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "slug": "super-admin",
      "description": "Full system access with all permissions"
    },
    {
      "id": 2,
      "name": "Editor",
      "slug": "editor",
      "description": "Can create and manage content"
    },
    {
      "id": 3,
      "name": "Viewer",
      "slug": "viewer",
      "description": "Read-only access to content"
    }
  ]
}
```

---

### 2. Get All Users

**Endpoint:** `GET /api/v1/users`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by email or name
- `roleId` (optional): Filter by role ID
- `isActive` (optional): Filter by active status (true/false)

**Request:**
```bash
curl "http://localhost:5001/api/v1/users?page=1&limit=10&search=admin" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@morphelabs.com",
      "fullName": "System Administrator",
      "role": {
        "id": 1,
        "name": "Super Admin",
        "slug": "super-admin"
      },
      "isActive": true,
      "lastLogin": "2026-02-14T07:56:02.515Z",
      "createdAt": "2026-02-14T07:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 3. Get User by ID

**Endpoint:** `GET /api/v1/users/:id`

**Request:**
```bash
curl http://localhost:5001/api/v1/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@morphelabs.com",
    "fullName": "System Administrator",
    "role": {
      "id": 1,
      "name": "Super Admin",
      "slug": "super-admin"
    },
    "isActive": true,
    "lastLogin": "2026-02-14T07:56:02.515Z",
    "createdAt": "2026-02-14T07:00:00.000Z",
    "updatedAt": "2026-02-14T07:56:02.515Z"
  }
}
```

---

### 4. Create New User

**Endpoint:** `POST /api/v1/users`

**Required Role:** Super Admin

**Request:**
```bash
curl -X POST http://localhost:5001/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "email": "editor@morphelabs.com",
    "password": "Editor@123456",
    "fullName": "Content Editor",
    "roleId": 2
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "editor@morphelabs.com",
    "fullName": "Content Editor",
    "roleId": 2,
    "isActive": true,
    "createdAt": "2026-02-14T08:00:00.000Z"
  }
}
```

---

### 5. Update User

**Endpoint:** `PATCH /api/v1/users/:id`

**Required Role:** Super Admin

**Request:**
```bash
curl -X PATCH http://localhost:5001/api/v1/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "fullName": "Senior Content Editor",
    "isActive": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "editor@morphelabs.com",
    "fullName": "Senior Content Editor",
    "role": {
      "id": 2,
      "name": "Editor",
      "slug": "editor"
    },
    "isActive": true,
    "lastLogin": null,
    "createdAt": "2026-02-14T08:00:00.000Z",
    "updatedAt": "2026-02-14T08:05:00.000Z"
  }
}
```

---

### 6. Delete User

**Endpoint:** `DELETE /api/v1/users/:id`

**Required Role:** Super Admin

**Request:**
```bash
curl -X DELETE http://localhost:5001/api/v1/users/2 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request data"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No authentication token provided"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 422 Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters long"
      }
    ]
  }
}
```

### 429 Rate Limit Exceeded
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Testing with Postman

### Import Collection

1. Create a new collection in Postman
2. Set collection variables:
   - `baseUrl`: `http://localhost:5001/api/v1`
   - `accessToken`: (will be set after login)

### Environment Setup

Create an environment with:
```json
{
  "baseUrl": "http://localhost:5001/api/v1",
  "accessToken": "",
  "refreshToken": ""
}
```

### Test Flow

1. **Login** → Save `accessToken` and `refreshToken`
2. **Get Current User** → Verify authentication
3. **Get All Users** → Test authorization
4. **Create User** → Test Super Admin permission
5. **Update User** → Test update functionality
6. **Delete User** → Test delete functionality

---

## Rate Limits

- **General API:** 100 requests per 15 minutes
- **Login:** 5 attempts per 15 minutes
- **Password Reset:** 3 requests per hour

---

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Soft delete is enabled for users (deleted users are not permanently removed)
- JWT access tokens expire after 1 hour
- JWT refresh tokens expire after 7 days
- Password reset tokens expire after 1 hour
