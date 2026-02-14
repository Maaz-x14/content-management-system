# API Testing Guide - Phases 4, 5, 6

This document provides `curl` commands to test the newly implemented API endpoints for Blog, Services, and Careers modules.

## Prerequisite
Ensure the server is running on `http://localhost:5001`.
You need a valid JWT token for `POST`, `PATCH`, `DELETE` operations. Replace `YOUR_TOKEN` with a valid token obtained from `/api/v1/auth/login`.

## Phase 4: Blog Module

### 1. Categories
**Create Category:**
```bash
curl -X POST http://localhost:5001/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Technology",
    "description": "Tech news and updates"
  }'
```

**Get Categories:**
```bash
curl http://localhost:5001/api/v1/categories
```

### 2. Tags
**Create Tag:**
```bash
curl -X POST http://localhost:5001/api/v1/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "NodeJS"
  }'
```

### 3. Blog Posts
**Create Post:**
```bash
curl -X POST http://localhost:5001/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Getting Started with Morphe CMS",
    "content": "This is a comprehensive guide...",
    "excerpt": "A quick intro",
    "status": "published",
    "categoryId": 1,
    "tags": [1]
  }'
```

**Get Posts:**
```bash
curl http://localhost:5001/api/v1/posts
```

## Phase 5: Services Module

### 1. Services
**Create Service:**
```bash
curl -X POST http://localhost:5001/api/v1/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Custom Web Development",
    "description": "Full-stack web solutions",
    "status": "published",
    "isFeatured": true,
    "technologies": ["React", "Node.js"],
    "category": "Development"
  }'
```

**Get Services:**
```bash
curl http://localhost:5001/api/v1/services
```

## Phase 6: Careers Module

### 1. Job Listings
**Create Job:**
```bash
curl -X POST http://localhost:5001/api/v1/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Senior Backend Engineer",
    "department": "Engineering",
    "location": "Remote",
    "employmentType": "full-time",
    "description": "We are looking for...",
    "responsibilities": ["Develop APIs", "Optimize DB"],
    "qualifications": ["5+ years Node.js"],
    "status": "active"
  }'
```

**Get Jobs:**
```bash
curl http://localhost:5001/api/v1/jobs
```

### 2. Job Applications
**Submit Application:**
```bash
curl -X POST http://localhost:5001/api/v1/jobs/1/apply \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "John Doe",
    "applicantEmail": "john@example.com",
    "resumeUrl": "https://example.com/resume.pdf",
    "coverLetter": "I am interested..."
  }'
```
