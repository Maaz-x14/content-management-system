# Database Schema Design
## Morphe Labs Custom CMS

**Database:** PostgreSQL 15+  
**Normalization Level:** Third Normal Form (3NF)  
**Character Set:** UTF-8  
**Collation:** en_US.UTF-8

---

## 1. Schema Overview

### 1.1 Entity-Relationship Diagram (Text Representation)

```
┌──────────────┐
│    roles     │
└──────┬───────┘
       │
       │ 1:N
       │
┌──────▼───────┐         1:N          ┌──────────────────┐
│    users     ├──────────────────────►│   blog_posts     │
└──────────────┘                       └────────┬─────────┘
                                                │
                                   ┌────────────┼────────────┐
                                   │            │            │
                            N:1    │     N:N    │     N:N    │
                                   │            │            │
                          ┌────────▼──────┐  ┌──▼─────────────────┐
                          │  categories   │  │ post_tags          │
                          └───────────────┘  └──┬─────────────────┘
                                                │
                                         N:1    │
                                                │
                                          ┌─────▼──────┐
                                          │    tags    │
                                          └────────────┘

┌──────────────┐         1:N          ┌──────────────────┐
│    users     ├──────────────────────►│    services      │
└──────────────┘                       └────────┬─────────┘
                                                │
                                         1:N    │
                                                │
                                      ┌─────────▼──────────┐
                                      │  service_images    │
                                      └────────────────────┘

┌──────────────┐         1:N          ┌──────────────────┐
│    users     ├──────────────────────►│   job_listings   │
└──────────────┘                       └────────┬─────────┘
                                                │
                                         1:N    │
                                                │
                                    ┌───────────▼──────────────┐
                                    │   job_applications       │
                                    └──────────────────────────┘

┌──────────────┐         1:N          ┌──────────────────┐
│    users     ├──────────────────────►│   media_files    │
└──────────────┘                       └──────────────────┘
```

### 1.2 Database Statistics (Expected)

| Table | Estimated Rows | Growth Rate |
|-------|----------------|-------------|
| users | 5-10 | Low (few admins) |
| roles | 3-5 | Very low (predefined) |
| blog_posts | 100-500 | Medium (weekly posts) |
| categories | 10-20 | Low |
| tags | 50-100 | Medium |
| services | 20-50 | Low (project portfolio) |
| service_images | 100-500 | Low-Medium |
| job_listings | 5-20 | Low-Medium |
| job_applications | 100-1000 | High (varies by hiring) |
| media_files | 200-1000 | Medium |

---

## 2. Core Tables

### 2.1 Table: `users`

**Description:** Stores user accounts for CMS access

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) 
        REFERENCES roles(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Constraints
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token) 
    WHERE password_reset_token IS NOT NULL;

-- Comments
COMMENT ON TABLE users IS 'CMS user accounts with authentication credentials';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password (12 rounds)';
COMMENT ON COLUMN users.password_reset_token IS 'Temporary token for password reset (expires in 1 hour)';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp (NULL = active)';
```

**Sample Data:**
```sql
INSERT INTO users (id, email, password_hash, full_name, role_id) VALUES
(1, 'admin@morphelabs.com', '$2b$12$...', 'John Doe', 1),
(2, 'editor@morphelabs.com', '$2b$12$...', 'Jane Smith', 2);
```

---

### 2.2 Table: `roles`

**Description:** Defines user roles and permissions

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_permissions ON roles USING GIN(permissions);

-- Comments
COMMENT ON TABLE roles IS 'User roles with permission definitions';
COMMENT ON COLUMN roles.permissions IS 'JSON object defining granular permissions';
```

**Sample Data:**
```sql
INSERT INTO roles (id, name, slug, description, permissions) VALUES
(1, 'Super Admin', 'super_admin', 'Full system access', 
 '{"users": ["create", "read", "update", "delete"], 
   "content": ["create", "read", "update", "delete"], 
   "settings": ["read", "update"]}'::jsonb),
(2, 'Editor', 'editor', 'Content management access', 
 '{"content": ["create", "read", "update", "delete"], 
   "media": ["create", "read", "delete"]}'::jsonb),
(3, 'Viewer', 'viewer', 'Read-only access', 
 '{"content": ["read"]}'::jsonb);
```

---

### 2.3 Table: `blog_posts`

**Description:** Stores blog articles and posts

```sql
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt VARCHAR(300),
    status VARCHAR(20) DEFAULT 'draft' NOT NULL,
    featured_image VARCHAR(500),
    published_at TIMESTAMP,
    scheduled_for TIMESTAMP,
    author_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    view_count INTEGER DEFAULT 0 NOT NULL,
    
    -- SEO fields
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    meta_keywords VARCHAR(255),
    canonical_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_post_author FOREIGN KEY (author_id) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_post_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT chk_status CHECK (status IN ('draft', 'published', 'scheduled', 'archived'))
);

-- Indexes
CREATE INDEX idx_posts_slug ON blog_posts(slug);
CREATE INDEX idx_posts_status ON blog_posts(status);
CREATE INDEX idx_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX idx_posts_scheduled_for ON blog_posts(scheduled_for) 
    WHERE scheduled_for IS NOT NULL AND status = 'scheduled';

-- Full-text search index
CREATE INDEX idx_posts_search ON blog_posts 
    USING GIN(to_tsvector('english', title || ' ' || content));

-- Comments
COMMENT ON TABLE blog_posts IS 'Blog articles and posts';
COMMENT ON COLUMN blog_posts.status IS 'Publication status: draft, published, scheduled, archived';
COMMENT ON COLUMN blog_posts.scheduled_for IS 'Auto-publish date/time (requires status=scheduled)';
COMMENT ON COLUMN blog_posts.view_count IS 'Number of times post was viewed (optional analytics)';
```

**Sample Data:**
```sql
INSERT INTO blog_posts (title, slug, content, excerpt, status, author_id, category_id, published_at) VALUES
('Getting Started with React', 'getting-started-with-react', 
 '<p>React is a JavaScript library...</p>', 
 'Learn the basics of React framework', 
 'published', 2, 1, '2026-02-14 10:00:00');
```

---

### 2.4 Table: `categories`

**Description:** Blog post categories for organization

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) 
        REFERENCES categories(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- Comments
COMMENT ON TABLE categories IS 'Blog post categories (supports hierarchy)';
COMMENT ON COLUMN categories.parent_id IS 'NULL for top-level categories, references parent for subcategories';
COMMENT ON COLUMN categories.display_order IS 'Numeric order for display sorting (lower first)';
```

**Sample Data:**
```sql
INSERT INTO categories (id, name, slug, description) VALUES
(1, 'Web Development', 'web-development', 'Articles about web development'),
(2, 'Mobile Apps', 'mobile-apps', 'Mobile application development'),
(3, 'Design', 'design', 'UI/UX and graphic design');
```

---

### 2.5 Table: `tags`

**Description:** Blog post tags for flexible categorization

```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(60) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX idx_tags_name ON tags(name);

-- Comments
COMMENT ON TABLE tags IS 'Blog post tags for flexible content categorization';
COMMENT ON COLUMN tags.usage_count IS 'Number of posts using this tag (denormalized for performance)';
```

**Sample Data:**
```sql
INSERT INTO tags (id, name, slug) VALUES
(1, 'React', 'react'),
(2, 'JavaScript', 'javascript'),
(3, 'TypeScript', 'typescript'),
(4, 'Node.js', 'nodejs');
```

---

### 2.6 Table: `post_tags` (Junction Table)

**Description:** Many-to-many relationship between posts and tags

```sql
CREATE TABLE post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) 
        REFERENCES blog_posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) 
        REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

-- Comments
COMMENT ON TABLE post_tags IS 'Junction table linking blog posts to tags (many-to-many)';
```

**Sample Data:**
```sql
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), -- Post 1 tagged with React
(1, 2); -- Post 1 tagged with JavaScript
```

---

## 3. Services/Portfolio Tables

### 3.1 Table: `services`

**Description:** Portfolio projects and services showcase

```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    client_name VARCHAR(100),
    project_url VARCHAR(500),
    project_date DATE,
    project_duration VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ongoing' NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    
    -- Categorization
    category VARCHAR(100) NOT NULL,
    technologies TEXT[], -- Array of technology names
    industry VARCHAR(100),
    
    -- Case study fields
    case_study_challenge TEXT,
    case_study_solution TEXT,
    case_study_results TEXT,
    case_study_metrics JSONB,
    
    -- Metadata
    created_by INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_service_creator FOREIGN KEY (created_by) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_service_status CHECK (status IN ('completed', 'ongoing', 'archived'))
);

-- Indexes
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_featured ON services(featured);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_technologies ON services USING GIN(technologies);
CREATE INDEX idx_services_industry ON services(industry);
CREATE INDEX idx_services_project_date ON services(project_date DESC);
CREATE INDEX idx_services_display_order ON services(display_order);
CREATE INDEX idx_services_deleted_at ON services(deleted_at);

-- Full-text search
CREATE INDEX idx_services_search ON services 
    USING GIN(to_tsvector('english', title || ' ' || description));

-- Comments
COMMENT ON TABLE services IS 'Portfolio projects and service offerings';
COMMENT ON COLUMN services.technologies IS 'Array of technology stack (e.g., ["React", "Node.js", "AWS"])';
COMMENT ON COLUMN services.case_study_metrics IS 'JSON array of metrics: [{"label": "Conversion Rate", "value": "+35%"}]';
COMMENT ON COLUMN services.display_order IS 'Manual ordering for featured projects';
```

**Sample Data:**
```sql
INSERT INTO services (title, slug, description, client_name, status, category, technologies, created_by) VALUES
('E-Commerce Platform Redesign', 'ecommerce-platform-redesign', 
 '<p>Complete platform overhaul...</p>', 
 'ABC Corporation', 'completed', 'Web Development', 
 ARRAY['React', 'Node.js', 'PostgreSQL'], 2);
```

---

### 3.2 Table: `service_images`

**Description:** Image gallery for service/portfolio projects

```sql
CREATE TABLE service_images (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_service_image_service FOREIGN KEY (service_id) 
        REFERENCES services(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_service_images_service_id ON service_images(service_id);
CREATE INDEX idx_service_images_display_order ON service_images(service_id, display_order);
CREATE INDEX idx_service_images_is_primary ON service_images(service_id, is_primary);

-- Comments
COMMENT ON TABLE service_images IS 'Image gallery for portfolio projects';
COMMENT ON COLUMN service_images.is_primary IS 'TRUE for hero/main image (only one per service)';
COMMENT ON COLUMN service_images.display_order IS 'Order of images in gallery';
```

**Sample Data:**
```sql
INSERT INTO service_images (service_id, image_url, is_primary, display_order) VALUES
(1, 'https://cdn.morphelabs.com/projects/project1-hero.jpg', true, 1),
(1, 'https://cdn.morphelabs.com/projects/project1-img2.jpg', false, 2);
```

---

## 4. Careers/Jobs Tables

### 4.1 Table: `job_listings`

**Description:** Job openings and career opportunities

```sql
CREATE TABLE job_listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    
    -- Location details
    location_type VARCHAR(20) NOT NULL,
    location_city VARCHAR(100),
    location_region VARCHAR(100),
    location_remote_policy TEXT,
    
    employment_type VARCHAR(20) NOT NULL,
    
    -- Job description
    description TEXT NOT NULL,
    responsibilities TEXT[] NOT NULL,
    qualifications_required TEXT[] NOT NULL,
    qualifications_preferred TEXT[],
    benefits TEXT[],
    
    -- Compensation (optional, can be hidden)
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(3) DEFAULT 'USD',
    salary_visible BOOLEAN DEFAULT false NOT NULL,
    
    -- Status and dates
    application_deadline DATE,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    
    -- Internal tracking
    internal_notes TEXT,
    posted_by INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_job_poster FOREIGN KEY (posted_by) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_location_type CHECK (location_type IN ('remote', 'on-site', 'hybrid')),
    CONSTRAINT chk_employment_type CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
    CONSTRAINT chk_job_status CHECK (status IN ('active', 'inactive'))
);

-- Indexes
CREATE INDEX idx_jobs_slug ON job_listings(slug);
CREATE INDEX idx_jobs_department ON job_listings(department);
CREATE INDEX idx_jobs_location_type ON job_listings(location_type);
CREATE INDEX idx_jobs_employment_type ON job_listings(employment_type);
CREATE INDEX idx_jobs_status ON job_listings(status);
CREATE INDEX idx_jobs_application_deadline ON job_listings(application_deadline);
CREATE INDEX idx_jobs_deleted_at ON job_listings(deleted_at);

-- Full-text search
CREATE INDEX idx_jobs_search ON job_listings 
    USING GIN(to_tsvector('english', title || ' ' || description));

-- Comments
COMMENT ON TABLE job_listings IS 'Job openings and career opportunities';
COMMENT ON COLUMN job_listings.location_type IS 'remote, on-site, or hybrid';
COMMENT ON COLUMN job_listings.responsibilities IS 'Array of responsibility bullet points';
COMMENT ON COLUMN job_listings.internal_notes IS 'Private notes (not visible to applicants)';
```

**Sample Data:**
```sql
INSERT INTO job_listings (title, slug, department, location_type, employment_type, description, responsibilities, qualifications_required, status, posted_by) VALUES
('Senior Full-Stack Developer', 'senior-full-stack-developer', 
 'Engineering', 'hybrid', 'full-time', 
 '<p>We are looking for an experienced developer...</p>',
 ARRAY['Build scalable web applications', 'Mentor junior developers'],
 ARRAY['5+ years experience with React and Node.js', 'Strong CS fundamentals'],
 'active', 2);
```

---

### 4.2 Table: `job_applications`

**Description:** Applications submitted for job listings

```sql
CREATE TABLE job_applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    
    -- Applicant information
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    resume_url VARCHAR(500) NOT NULL,
    resume_filename VARCHAR(255) NOT NULL,
    cover_letter TEXT,
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    
    -- Application tracking
    status VARCHAR(20) DEFAULT 'new' NOT NULL,
    notes TEXT,
    
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_application_job FOREIGN KEY (job_id) 
        REFERENCES job_listings(id) ON DELETE CASCADE,
    CONSTRAINT chk_application_status CHECK (status IN ('new', 'reviewing', 'interview', 'rejected', 'hired'))
);

-- Indexes
CREATE INDEX idx_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_applications_applicant_email ON job_applications(applicant_email);
CREATE INDEX idx_applications_applied_at ON job_applications(applied_at DESC);

-- Comments
COMMENT ON TABLE job_applications IS 'Job applications submitted by candidates';
COMMENT ON COLUMN job_applications.status IS 'Application status: new, reviewing, interview, rejected, hired';
COMMENT ON COLUMN job_applications.notes IS 'Internal notes about the applicant';
```

**Sample Data:**
```sql
INSERT INTO job_applications (job_id, applicant_name, applicant_email, applicant_phone, resume_url, resume_filename) VALUES
(1, 'John Smith', 'john.smith@email.com', '+1-555-0123', 
 'https://storage.morphelabs.com/resumes/abc123.pdf', 'john_smith_resume.pdf');
```

---

## 5. Media Management Tables

### 5.1 Table: `media_files`

**Description:** Centralized media file management

```sql
CREATE TABLE media_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    
    -- File metadata
    file_type VARCHAR(20) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- Image-specific metadata (NULL for non-images)
    image_width INTEGER,
    image_height INTEGER,
    alt_text VARCHAR(255),
    
    -- Tracking
    uploaded_by INTEGER NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_media_uploader FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT chk_file_type CHECK (file_type IN ('image', 'document', 'video', 'other'))
);

-- Indexes
CREATE INDEX idx_media_filename ON media_files(filename);
CREATE INDEX idx_media_file_type ON media_files(file_type);
CREATE INDEX idx_media_uploaded_by ON media_files(uploaded_by);
CREATE INDEX idx_media_created_at ON media_files(created_at DESC);
CREATE INDEX idx_media_deleted_at ON media_files(deleted_at);

-- Full-text search on filenames
CREATE INDEX idx_media_search ON media_files 
    USING GIN(to_tsvector('english', original_name || ' ' || COALESCE(alt_text, '')));

-- Comments
COMMENT ON TABLE media_files IS 'Centralized media file storage and metadata';
COMMENT ON COLUMN media_files.file_path IS 'Relative path in storage system';
COMMENT ON COLUMN media_files.file_url IS 'Full public URL (CDN or storage URL)';
COMMENT ON COLUMN media_files.file_size IS 'File size in bytes';
```

**Sample Data:**
```sql
INSERT INTO media_files (filename, original_name, file_path, file_url, file_type, mime_type, file_size, uploaded_by) VALUES
('abc123def.jpg', 'hero-image.jpg', '2026/02/abc123def.jpg', 
 'https://cdn.morphelabs.com/images/2026/02/abc123def.jpg', 
 'image', 'image/jpeg', 245678, 2);
```

---

## 6. Audit and Activity Tracking (Optional Enhancement)

### 6.1 Table: `activity_logs`

**Description:** Audit trail of user actions

```sql
CREATE TABLE activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_action ON activity_logs(action);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC);

-- Partition by month (for large datasets)
-- CREATE TABLE activity_logs_2026_02 PARTITION OF activity_logs
--     FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Comments
COMMENT ON TABLE activity_logs IS 'Audit trail of user actions (optional)';
COMMENT ON COLUMN activity_logs.action IS 'Action performed: create, update, delete, login, etc.';
COMMENT ON COLUMN activity_logs.old_values IS 'JSON snapshot of data before change';
COMMENT ON COLUMN activity_logs.new_values IS 'JSON snapshot of data after change';
```

**Sample Data:**
```sql
INSERT INTO activity_logs (user_id, action, entity_type, entity_id, new_values) VALUES
(2, 'create', 'blog_post', 1, '{"title": "Getting Started with React", "status": "draft"}'::jsonb);
```

---

## 7. Database Functions and Triggers

### 7.1 Auto-Update Timestamp Trigger

```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON job_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... repeat for other tables
```

---

### 7.2 Slug Generation Function (Optional Helper)

```sql
-- Function to generate URL-friendly slug from title
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Usage example:
-- SELECT generate_slug('Getting Started with React!'); 
-- Returns: 'getting-started-with-react'
```

---

### 7.3 Tag Usage Counter Trigger

```sql
-- Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER update_tag_usage_after_insert
    AFTER INSERT ON post_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER update_tag_usage_after_delete
    AFTER DELETE ON post_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();
```

---

## 8. Views (Materialized for Performance)

### 8.1 View: Published Posts with Author and Category

```sql
CREATE VIEW v_published_posts AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image,
    p.published_at,
    p.view_count,
    p.meta_title,
    p.meta_description,
    u.full_name AS author_name,
    u.email AS author_email,
    c.name AS category_name,
    c.slug AS category_slug
FROM blog_posts p
JOIN users u ON p.author_id = u.id
JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published' 
    AND p.deleted_at IS NULL
ORDER BY p.published_at DESC;

-- Comments
COMMENT ON VIEW v_published_posts IS 'Simplified view of published posts for public API';
```

---

### 8.2 Materialized View: Popular Posts (Updated Daily)

```sql
CREATE MATERIALIZED VIEW mv_popular_posts AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.featured_image,
    p.view_count,
    c.name AS category_name
FROM blog_posts p
JOIN categories c ON p.category_id = c.id
WHERE p.status = 'published' 
    AND p.deleted_at IS NULL
    AND p.published_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY p.view_count DESC
LIMIT 10;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_mv_popular_posts_id ON mv_popular_posts(id);

-- Refresh strategy (run via cron or scheduled job)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_posts;
```

---

## 9. Database Seeding Scripts

### 9.1 Initial Roles

```sql
-- Seed default roles
INSERT INTO roles (name, slug, description, permissions) VALUES
('Super Admin', 'super_admin', 'Full system access', 
 '{"users": ["create", "read", "update", "delete"], 
   "content": ["create", "read", "update", "delete"], 
   "settings": ["read", "update"]}'::jsonb),
('Editor', 'editor', 'Content management access', 
 '{"content": ["create", "read", "update", "delete"], 
   "media": ["create", "read", "delete"]}'::jsonb),
('Viewer', 'viewer', 'Read-only access', 
 '{"content": ["read"]}'::jsonb)
ON CONFLICT (slug) DO NOTHING;
```

---

### 9.2 Default Admin User

```sql
-- Create default admin user (password: ChangeMe123!)
-- NOTE: Change password immediately after first login
INSERT INTO users (email, password_hash, full_name, role_id) VALUES
('admin@morphelabs.com', 
 '$2b$12$KIXxLj4QZ3Y5QZ3Y5QZ3YuO8k7l6m5n4o3p2q1r0s9t8u7v6w5x4y3z', 
 'Default Admin', 
 (SELECT id FROM roles WHERE slug = 'super_admin'))
ON CONFLICT (email) DO NOTHING;
```

---

### 9.3 Sample Categories

```sql
-- Seed sample blog categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Web Development', 'web-development', 'Articles about web development', 1),
('Mobile Apps', 'mobile-apps', 'Mobile application development', 2),
('Design', 'design', 'UI/UX and graphic design', 3),
('DevOps', 'devops', 'Deployment and infrastructure', 4),
('Data Science', 'data-science', 'Data analysis and machine learning', 5)
ON CONFLICT (slug) DO NOTHING;
```

---

## 10. Database Maintenance

### 10.1 Backup Strategy

```bash
# Daily automated backup script
pg_dump -U postgres -d morphe_cms_prod \
    --format=custom \
    --file=/backups/morphe_cms_$(date +%Y%m%d).dump

# Retention: Keep daily backups for 30 days
find /backups -name "morphe_cms_*.dump" -mtime +30 -delete
```

---

### 10.2 Restore Process

```bash
# Restore from backup
pg_restore -U postgres -d morphe_cms_prod \
    --clean \
    --if-exists \
    /backups/morphe_cms_20260214.dump
```

---

### 10.3 Database Statistics Update

```sql
-- Run weekly to update query planner statistics
ANALYZE VERBOSE;

-- Vacuum and analyze (reclaim space and update stats)
VACUUM ANALYZE;

-- For heavily updated tables
VACUUM FULL media_files;
REINDEX TABLE media_files;
```

---

### 10.4 Monitor Slow Queries

```sql
-- Enable slow query logging in postgresql.conf
-- log_min_duration_statement = 1000  # Log queries taking > 1 second

-- Query to find slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 11. Migration Scripts

### 11.1 Migration: Add Full-Text Search to Blog Posts

```sql
-- Migration: 001_add_blog_fulltext_search.sql
-- Up
ALTER TABLE blog_posts 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (
    to_tsvector('english', 
        coalesce(title, '') || ' ' || 
        coalesce(content, '') || ' ' || 
        coalesce(excerpt, '')
    )
) STORED;

CREATE INDEX idx_blog_posts_search_vector 
    ON blog_posts USING GIN(search_vector);

-- Down (rollback)
-- DROP INDEX idx_blog_posts_search_vector;
-- ALTER TABLE blog_posts DROP COLUMN search_vector;
```

---

### 11.2 Migration: Add Soft Delete to All Tables

```sql
-- Migration: 002_add_soft_delete.sql
-- Up
ALTER TABLE blog_posts ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE services ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE job_listings ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE media_files ADD COLUMN deleted_at TIMESTAMP;

CREATE INDEX idx_blog_posts_deleted_at ON blog_posts(deleted_at);
CREATE INDEX idx_services_deleted_at ON services(deleted_at);
CREATE INDEX idx_job_listings_deleted_at ON job_listings(deleted_at);
CREATE INDEX idx_media_files_deleted_at ON media_files(deleted_at);

-- Down
-- ALTER TABLE blog_posts DROP COLUMN deleted_at;
-- (repeat for other tables)
```

---

## 12. Performance Optimization

### 12.1 Index Usage Analysis

```sql
-- Find unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;
```

---

### 12.2 Table Size Monitoring

```sql
-- Check table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

### 12.3 Connection Pool Configuration

```javascript
// Recommended connection pool settings (Node.js)
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'morphe_cms',
    user: 'cms_user',
    password: process.env.DB_PASSWORD,
    max: 10,                // Maximum connections in pool
    min: 2,                 // Minimum connections to maintain
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

---

## Appendix A: ER Diagram (Extended)

```
┌──────────────┐
│    roles     │
│──────────────│
│ id (PK)      │
│ name         │
│ slug (UQ)    │
│ permissions  │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼───────────────┐
│    users             │
│──────────────────────│
│ id (PK)              │
│ email (UQ)           │
│ password_hash        │
│ full_name            │
│ role_id (FK)         │
│ is_active            │
│ last_login           │
│ created_at           │
│ updated_at           │
│ deleted_at           │
└──────┬───────────────┘
       │ 1
       │
       ├──────────────┬──────────────┬──────────────┬
       │ N            │ N            │ N            │ N
       │              │              │              │
┌──────▼───────┐ ┌───▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│ blog_posts   │ │ services │ │job_list  │ │media_files  │
│──────────────│ │──────────│ │──────────│ │─────────────│
│ id (PK)      │ │ id (PK)  │ │ id (PK)  │ │ id (PK)     │
│ title        │ │ title    │ │ title    │ │ filename    │
│ slug (UQ)    │ │ slug(UQ) │ │ slug(UQ) │ │ file_url    │
│ content      │ │ descrip. │ │ dept.    │ │ file_type   │
│ status       │ │ client   │ │ location │ │ uploaded_by │
│ author_id(FK)│ │ status   │ │ status   │ │             │
│ category(FK) │ │ created  │ │ posted   │ │             │
│ published_at │ │          │ │          │ │             │
└──────┬───────┘ └────┬─────┘ └────┬─────┘ └─────────────┘
       │              │             │
       │ N            │ N           │ N
       │              │             │
       │         ┌────▼─────────┐   │
       │         │service_images│   │
       │         │──────────────│   │
       │         │ id (PK)      │   │
       │         │ service_id   │   │
       │         │ image_url    │   │
       │         │ is_primary   │   │
       │         └──────────────┘   │
       │                            │
       │ N                          │ N
       │                            │
┌──────▼───────┐            ┌──────▼────────────┐
│ post_tags    │            │ job_applications  │
│──────────────│            │───────────────────│
│ post_id(FK,PK│            │ id (PK)           │
│ tag_id(FK,PK)│            │ job_id (FK)       │
└──────┬───────┘            │ applicant_name    │
       │ N                  │ applicant_email   │
       │                    │ resume_url        │
       │ 1                  │ status            │
┌──────▼───────┐            └───────────────────┘
│    tags      │
│──────────────│
│ id (PK)      │
│ name (UQ)    │
│ slug (UQ)    │
│ usage_count  │
└──────────────┘
```

---

**End of Database Schema Document**