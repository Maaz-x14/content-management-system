# API Testing Guide - Phases 7 (Media) & 8 (Dashboard)

This document provides `curl` commands to test the newly implemented API endpoints.

## Prerequisite
Ensure the server is running on `http://localhost:5001`.
You need a valid JWT token for `POST`, `PATCH`, `DELETE` operations. Replace `YOUR_TOKEN` with a valid token obtained from `/api/v1/auth/login`.

## Phase 7: Media Library

### 1. Upload File
**Upload an image:**
```bash
curl -X POST http://localhost:5001/api/v1/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "altText=Sample Image"
```

### 2. List Media Files
**Get all media files:**
```bash
curl "http://localhost:5001/api/v1/media?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Filter by type (image):**
```bash
curl "http://localhost:5001/api/v1/media?type=image" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Media Details
**Get by ID:**
```bash
curl "http://localhost:5001/api/v1/media/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Media
**Update alt text:**
```bash
curl -X PUT http://localhost:5001/api/v1/media/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "altText": "Updated alt text"
  }'
```

### 5. Delete Media
**Delete file:**
```bash
curl -X DELETE http://localhost:5001/api/v1/media/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Phase 8: Dashboard

### 1. Get Dashboard Stats
**Get overview and recent activity:**
```bash
curl "http://localhost:5001/api/v1/dashboard/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
