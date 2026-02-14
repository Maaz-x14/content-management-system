# 🚀 Future Roadmap & Next Steps

This document outlines the planned features, enhancements, and technical debt cleanup for the Morphe Labs CMS project.

## 🎨 Frontend Enhancements

### User Experience (UX)
- [ ] **Rich Text Editor**: Replace standard textareas with a rich text editor (e.g., Tiptap or Quill) for Blog Posts and Service descriptions.
- [ ] **Image Previews**: Add image preview functionality in forms when selecting media from the library.
- [ ] **Drag & Drop**: Implement drag-and-drop file upload for the Media Library.
- [ ] **Skeleton Loading**: Replace generic loading spinners with skeleton screens for a smoother perceived performance.
- [ ] **Toast Notifications**: Standardize error and success messages across all CRUD operations.

### Features
- [ ] **Profile Settings**: implementing the actual profile update functionality in the Settings page.
- [ ] **Dark/Light Mode Toggle**: Although currently dark-themed, adding a toggle for user preference.
- [ ] **Advanced Filtering**: Add filter by status, date range, and author for Posts and Jobs tables.
- [ ] **Bulk Actions**: Allow selecting multiple items in tables to delete or update status in bulk.

## 🛠 Backend Improvements

### Performance & Scalability
- [ ] **Caching**: Implement Redis caching for public-facing API endpoints (e.g., `GET /posts`, `GET /services`).
- [ ] **Rate Limiting**: Fine-tune rate limiting rules for specific high-risk endpoints.
- [ ] **Database Indexing**: Analyze query performance and add missing indexes to foreign keys and frequently searched columns.

### Security
- [ ] **Two-Factor Authentication (2FA)**: Add 2FA support for Admin accounts.
- [ ] **Session Management**: Implement robust session revocation and active session listing.
- [ ] **Audit Logging**: Create a detailed audit log for every write action (CREATE, UPDATE, DELETE) performed by admins.

### Functionality
- [ ] **Email Service**: Integrate a real email provider (SendGrid/AWS SES) for password resets and job application notifications.
- [ ] **Media Optimization**: Implement server-side image resizing and compression using `sharp` upon upload.

## 🏗 DevOps & Deployment

- [ ] **Docker Support**: Create `Dockerfile` for both Backend and Frontend, and a `docker-compose.yml` for easy orchestration.
- [ ] **CI/CD Pipelines**: Set up GitHub Actions for automated testing and linting on push.
- [ ] **Environment Configuration**: Standardize environment variables validation using `envalid` or `zod`.
- [ ] **Monitoring**: Integrate a monitoring solution (e.g., Sentry, Prometheus + Grafana) for error tracking and performance metrics.

## 🧪 Testing

- [ ] **E2E Testing**: Set up Cypress or Playwright for End-to-End testing of critical flows (Login -> Create Post -> Logout).
- [ ] **Unit Tests**: Increase backend unit test coverage to >80%.
- [ ] **Integration Tests**: Ensure all new API endpoints have corresponding integration tests.

## 🧹 Documentation

- [ ] **API Reference**: Keep Swagger/OpenAPI documentation auto-generated and up-to-date.
- [ ] **User Guide**: Create a brief manual for non-technical CMS users explaining how to manage content.
