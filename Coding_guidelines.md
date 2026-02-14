# Coding Guidelines
## Morphe Labs Custom CMS

**Version:** 1.0  
**Last Updated:** February 14, 2026  
**Applies To:** Backend (Node.js/TypeScript) and Frontend (React/TypeScript)

---

## 1. General Principles

### 1.1 Code Quality Standards

**SOLID Principles:**
- **S**ingle Responsibility: Each function/class should have one purpose
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable for base types
- **I**nterface Segregation: Many specific interfaces > one general interface
- **D**ependency Inversion: Depend on abstractions, not concretions

**DRY (Don't Repeat Yourself):**
- Extract common logic into reusable functions
- Use utility functions and helper modules
- Avoid copy-pasting code

**KISS (Keep It Simple, Stupid):**
- Write simple, readable code
- Avoid over-engineering
- Prefer clarity over cleverness

**YAGNI (You Aren't Gonna Need It):**
- Don't build features before they're needed
- Focus on current requirements
- Avoid premature optimization

---

### 1.2 Code Review Requirements

All code must pass review before merging:
- [ ] Follows naming conventions
- [ ] Has appropriate comments
- [ ] Includes tests for new features
- [ ] No console.log or commented-out code
- [ ] Error handling implemented
- [ ] Security considerations addressed
- [ ] Performance acceptable
- [ ] Documentation updated if needed

---

## 2. TypeScript Guidelines

### 2.1 Type Safety

**Always use explicit types:**
```typescript
// ❌ BAD: Implicit any
function getUser(id) {
  return database.users.find(id);
}

// ✅ GOOD: Explicit types
function getUser(id: number): Promise<User | null> {
  return database.users.find(id);
}
```

**Avoid `any` type:**
```typescript
// ❌ BAD: Using any
const data: any = await fetchData();

// ✅ GOOD: Define interface
interface ApiResponse {
  success: boolean;
  data: User[];
}

const response: ApiResponse = await fetchData();
```

**Use union types and type guards:**
```typescript
// ✅ GOOD: Union types
type Status = 'draft' | 'published' | 'archived';

function setStatus(post: BlogPost, status: Status): void {
  post.status = status;
}

// ✅ GOOD: Type guard
function isPublished(post: BlogPost): boolean {
  return post.status === 'published';
}
```

---

### 2.2 Interface Definitions

**Define interfaces for all data structures:**
```typescript
// src/types/blog.types.ts
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  authorId: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogPostDTO {
  title: string;
  content: string;
  categoryId: number;
  tagIds?: number[];
  status?: PostStatus;
}

export interface UpdateBlogPostDTO extends Partial<CreateBlogPostDTO> {
  id: number;
}

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';
```

**Use Pick, Omit, Partial for type transformations:**
```typescript
// Pick specific fields
type BlogPostSummary = Pick<BlogPost, 'id' | 'title' | 'slug' | 'publishedAt'>;

// Omit sensitive fields
type PublicUser = Omit<User, 'passwordHash' | 'passwordResetToken'>;

// Make all fields optional
type PartialBlogPost = Partial<BlogPost>;
```

---

## 3. Backend Guidelines (Node.js/Express)

### 3.1 Project Structure

**Follow layered architecture:**
```
src/
├── controllers/   # Handle HTTP requests/responses
├── services/      # Business logic
├── models/        # Database models
├── routes/        # Route definitions
├── middleware/    # Custom middleware
└── utils/         # Helper functions
```

**Separation of concerns:**
- Controllers: Request/response handling only
- Services: Business logic, data validation
- Models: Data access layer
- Routes: Endpoint definitions
- Middleware: Cross-cutting concerns (auth, validation, logging)

---

### 3.2 Controller Pattern

```typescript
// src/controllers/blog.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services/blog.service';
import { CreateBlogPostDTO } from '../types/blog.types';
import { ApiError } from '../utils/ApiError';

export class BlogController {
  /**
   * Get all blog posts
   * @route GET /api/v1/blog/posts
   * @access Private (Editor, Super Admin)
   */
  static async getAllPosts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, status, category } = req.query;

      const result = await BlogService.getAllPosts({
        page: Number(page),
        limit: Number(limit),
        status: status as string | undefined,
        categoryId: category ? Number(category) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new blog post
   * @route POST /api/v1/blog/posts
   * @access Private (Editor, Super Admin)
   */
  static async createPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.id; // Set by auth middleware
      const postData: CreateBlogPostDTO = req.body;

      const newPost = await BlogService.createPost(postData, userId);

      res.status(201).json({
        success: true,
        data: newPost,
        message: 'Blog post created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
```

---

### 3.3 Service Layer Pattern

```typescript
// src/services/blog.service.ts
import { BlogPost } from '../models/BlogPost.model';
import { CreateBlogPostDTO, UpdateBlogPostDTO } from '../types/blog.types';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/slugify';

export class BlogService {
  /**
   * Get all blog posts with pagination and filters
   */
  static async getAllPosts(params: {
    page: number;
    limit: number;
    status?: string;
    categoryId?: number;
  }) {
    const { page, limit, status, categoryId } = params;
    const offset = (page - 1) * limit;

    // Build query conditions
    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;

    // Execute query
    const { count, rows } = await BlogPost.findAndCountAll({
      where,
      limit,
      offset,
      include: ['author', 'category', 'tags'],
      order: [['createdAt', 'DESC']],
    });

    return {
      posts: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Create new blog post
   */
  static async createPost(
    data: CreateBlogPostDTO,
    authorId: number
  ): Promise<BlogPost> {
    // Generate slug if not provided
    const slug = data.slug || slugify(data.title);

    // Check if slug already exists
    const existing = await BlogPost.findOne({ where: { slug } });
    if (existing) {
      throw new ApiError(409, 'SLUG_EXISTS', 'URL slug already in use');
    }

    // Create post
    const post = await BlogPost.create({
      ...data,
      slug,
      authorId,
      status: data.status || 'draft',
    });

    // Add tags if provided
    if (data.tagIds && data.tagIds.length > 0) {
      await post.setTags(data.tagIds);
    }

    return post;
  }

  /**
   * Update blog post
   */
  static async updatePost(
    id: number,
    data: UpdateBlogPostDTO,
    userId: number
  ): Promise<BlogPost> {
    const post = await BlogPost.findByPk(id);
    if (!post) {
      throw new ApiError(404, 'POST_NOT_FOUND', 'Blog post not found');
    }

    // Check permissions (editors can only edit their own posts)
    if (post.authorId !== userId && !req.user.isAdmin) {
      throw new ApiError(403, 'FORBIDDEN', "You can't edit this post");
    }

    // Update slug if title changed
    if (data.title && data.title !== post.title) {
      data.slug = slugify(data.title);
    }

    await post.update(data);

    // Update tags if provided
    if (data.tagIds) {
      await post.setTags(data.tagIds);
    }

    return post;
  }
}
```

---

### 3.4 Error Handling

**Custom error class:**
```typescript
// src/utils/ApiError.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Global error handler middleware:**
```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
  });

  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: err.errors.map((e: any) => ({
          field: e.path,
          message: e.message,
        })),
      },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
    });
    return;
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
    },
  });
}
```

**Using errors in services:**
```typescript
// Throw errors with specific codes
if (!user) {
  throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
}

if (user.role !== 'admin') {
  throw new ApiError(403, 'FORBIDDEN', 'Insufficient permissions');
}

if (existingEmail) {
  throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
}
```

---

### 3.5 Input Validation

**Use express-validator:**
```typescript
// src/middleware/validate.middleware.ts
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation rules
export const createBlogPostValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'scheduled', 'archived'])
    .withMessage('Invalid status value'),
  
  body('tagIds')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tagIds.*')
    .isInt({ min: 1 })
    .withMessage('Each tag ID must be a valid integer'),
];

// Validation error handler
export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array().map(err => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }
  
  next();
}
```

**Use in routes:**
```typescript
// src/routes/blog.routes.ts
import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { createBlogPostValidation, validate } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/posts',
  authenticate,
  authorize(['editor', 'super_admin']),
  createBlogPostValidation,
  validate,
  BlogController.createPost
);

export default router;
```

---

### 3.6 Database Queries

**Use ORM properly (avoid N+1 queries):**
```typescript
// ❌ BAD: N+1 query problem
const posts = await BlogPost.findAll();
for (const post of posts) {
  const author = await User.findByPk(post.authorId); // N queries!
  post.author = author;
}

// ✅ GOOD: Use eager loading
const posts = await BlogPost.findAll({
  include: [
    { model: User, as: 'author' },
    { model: Category, as: 'category' },
    { model: Tag, as: 'tags' },
  ],
});
```

**Use indexes for frequently queried fields:**
```typescript
// In model definition
@Table({
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['status'] },
    { fields: ['publishedAt'] },
    { fields: ['authorId'] },
  ],
})
export class BlogPost extends Model {
  // ...
}
```

**Use transactions for related operations:**
```typescript
import { sequelize } from '../config/database';

async function createPostWithTags(postData: any, tagIds: number[]) {
  const transaction = await sequelize.transaction();
  
  try {
    // Create post
    const post = await BlogPost.create(postData, { transaction });
    
    // Add tags
    await post.setTags(tagIds, { transaction });
    
    // Commit transaction
    await transaction.commit();
    return post;
  } catch (error) {
    // Rollback on error
    await transaction.rollback();
    throw error;
  }
}
```

---

### 3.7 Authentication & Authorization

**JWT middleware:**
```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User.model';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Missing authentication token');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    // Get user from database
    const user = await User.findByPk(decoded.userId, {
      include: ['role'],
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid authentication token');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
}

/**
 * Check if user has required role
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role.slug)) {
      throw new ApiError(
        403,
        'FORBIDDEN',
        'You do not have permission to access this resource'
      );
    }

    next();
  };
}
```

---

### 3.8 Logging

**Use Winston for structured logging:**
```typescript
// src/utils/logger.ts
import winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production' ? json() : devFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), devFormat),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Usage examples:
// logger.info('User logged in', { userId: 123 });
// logger.error('Database connection failed', { error: err.message });
// logger.debug('Processing request', { url: req.url, method: req.method });
```

---

## 4. Frontend Guidelines (React/TypeScript)

### 4.1 Component Structure

**Functional components with TypeScript:**
```typescript
// src/components/blog/PostList.tsx
import React, { useState } from 'react';
import { BlogPost } from '@/types/blog.types';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Spinner } from '@/components/common/Spinner';

interface PostListProps {
  status?: 'draft' | 'published' | 'all';
  onPostClick?: (post: BlogPost) => void;
}

export const PostList: React.FC<PostListProps> = ({ 
  status = 'all', 
  onPostClick 
}) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useBlogPosts({ page, status });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="text-red-600">Error loading posts</div>;
  }

  return (
    <div className="space-y-4">
      {data?.posts.map(post => (
        <div 
          key={post.id} 
          className="border p-4 rounded cursor-pointer hover:bg-gray-50"
          onClick={() => onPostClick?.(post)}
        >
          <h3 className="text-lg font-semibold">{post.title}</h3>
          <p className="text-gray-600">{post.excerpt}</p>
          <span className="text-sm text-gray-500">
            {post.status} • {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={!data?.pagination.hasNext}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

---

### 4.2 Custom Hooks

**Data fetching with React Query:**
```typescript
// src/hooks/useBlogPosts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/services/blog.service';
import { BlogPost, CreateBlogPostDTO } from '@/types/blog.types';

interface UseBlogPostsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export function useBlogPosts(params: UseBlogPostsParams = {}) {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => blogService.getAllPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlogPostDTO) => blogService.createPost(data),
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BlogPost> }) =>
      blogService.updatePost(id, data),
    onSuccess: (updatedPost) => {
      // Update cache
      queryClient.setQueryData(['blog-post', updatedPost.id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}
```

---

### 4.3 Form Handling

**Use React Hook Form:**
```typescript
// src/components/forms/BlogPostForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { CreateBlogPostDTO } from '@/types/blog.types';
import { useCreateBlogPost } from '@/hooks/useBlogPosts';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export const BlogPostForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateBlogPostDTO>();
  const createPost = useCreateBlogPost();

  const onSubmit = async (data: CreateBlogPostDTO) => {
    try {
      await createPost.mutateAsync(data);
      alert('Post created successfully!');
    } catch (error) {
      alert('Error creating post');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          {...register('title', { 
            required: 'Title is required',
            maxLength: { value: 200, message: 'Max 200 characters' }
          })}
        />
        {errors.title && (
          <span className="text-red-600 text-sm">{errors.title.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          {...register('content', { required: 'Content is required' })}
          className="w-full border rounded p-2"
          rows={10}
        />
        {errors.content && (
          <span className="text-red-600 text-sm">{errors.content.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          {...register('categoryId', { required: 'Category is required' })}
          className="w-full border rounded p-2"
        >
          <option value="">Select category</option>
          {/* Map categories here */}
        </select>
        {errors.categoryId && (
          <span className="text-red-600 text-sm">{errors.categoryId.message}</span>
        )}
      </div>

      <Button type="submit" disabled={createPost.isPending}>
        {createPost.isPending ? 'Creating...' : 'Create Post'}
      </Button>
    </form>
  );
};
```

---

### 4.4 State Management

**Use Context for global state:**
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user.types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### 4.5 API Service Layer

**Centralized API calls:**
```typescript
// src/services/api.ts
import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Service modules:**
```typescript
// src/services/blog.service.ts
import api from './api';
import { BlogPost, CreateBlogPostDTO } from '@/types/blog.types';

export const blogService = {
  async getAllPosts(params: any = {}) {
    const response = await api.get('/blog/posts', { params });
    return response.data.data;
  },

  async getPostById(id: number): Promise<BlogPost> {
    const response = await api.get(`/blog/posts/${id}`);
    return response.data.data;
  },

  async createPost(data: CreateBlogPostDTO): Promise<BlogPost> {
    const response = await api.post('/blog/posts', data);
    return response.data.data;
  },

  async updatePost(id: number, data: Partial<BlogPost>): Promise<BlogPost> {
    const response = await api.patch(`/blog/posts/${id}`, data);
    return response.data.data;
  },

  async deletePost(id: number): Promise<void> {
    await api.delete(`/blog/posts/${id}`);
  },
};
```

---

## 5. Naming Conventions

### 5.1 Variables and Functions

```typescript
// ✅ GOOD: camelCase for variables and functions
const userEmail = 'user@example.com';
const isAuthenticated = true;
function calculateTotal() { ... }
async function fetchUserData() { ... }

// ❌ BAD: snake_case or PascalCase
const user_email = 'user@example.com';
const IsAuthenticated = true;
function Calculate_Total() { ... }
```

---

### 5.2 Classes and Interfaces

```typescript
// ✅ GOOD: PascalCase for classes and interfaces
class UserService { ... }
interface BlogPost { ... }
type PostStatus = 'draft' | 'published';

// ❌ BAD: camelCase
class userService { ... }
interface blogPost { ... }
```

---

### 5.3 Constants

```typescript
// ✅ GOOD: UPPER_SNAKE_CASE for constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const API_VERSION = 'v1';
const DEFAULT_PAGE_SIZE = 10;

// ❌ BAD: camelCase for constants
const maxFileSize = 5242880;
const apiVersion = 'v1';
```

---

### 5.4 Files and Folders

```typescript
// ✅ GOOD: kebab-case for files
// blog-post.controller.ts
// user-management.service.ts
// auth-context.tsx

// ✅ GOOD: PascalCase for React components
// BlogPost.tsx
// UserList.tsx
// LoginForm.tsx

// ❌ BAD: snake_case or camelCase
// blog_post.controller.ts
// blogPost.controller.ts
```

---

## 6. Comments and Documentation

### 6.1 JSDoc Comments

```typescript
/**
 * Create a new blog post
 * 
 * @param data - Blog post data
 * @param userId - ID of the user creating the post
 * @returns The created blog post
 * @throws {ApiError} If slug already exists or validation fails
 * 
 * @example
 * ```typescript
 * const post = await BlogService.createPost({
 *   title: 'My First Post',
 *   content: '<p>Hello world</p>',
 *   categoryId: 1
 * }, 123);
 * ```
 */
async function createPost(
  data: CreateBlogPostDTO,
  userId: number
): Promise<BlogPost> {
  // Implementation
}
```

---

### 6.2 Inline Comments

```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Check permissions before allowing deletion
if (post.authorId !== userId && !user.isAdmin) {
  throw new ApiError(403, 'FORBIDDEN', 'Cannot delete this post');
}

// ❌ BAD: Stating the obvious
// Check if post author ID is not equal to user ID
if (post.authorId !== userId) {
  // Throw error
  throw new ApiError(403, 'FORBIDDEN', 'Cannot delete');
}
```

---

## 7. Security Best Practices

### 7.1 Never Hardcode Secrets

```typescript
// ❌ BAD
const JWT_SECRET = 'my-secret-key';
const DB_PASSWORD = 'password123';

// ✅ GOOD
const JWT_SECRET = process.env.JWT_SECRET;
const DB_PASSWORD = process.env.DB_PASSWORD;
```

---

### 7.2 Sanitize User Input

```typescript
// ✅ GOOD: Validate and sanitize
import { body } from 'express-validator';

body('title').trim().escape();
body('email').normalizeEmail().isEmail();
```

---

### 7.3 Use Parameterized Queries

```typescript
// ✅ GOOD: ORM handles this automatically
const user = await User.findOne({ where: { email } });

// ❌ BAD: SQL injection risk
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

---

### 7.4 Hash Passwords Properly

```typescript
import bcrypt from 'bcrypt';

// ✅ GOOD: Use bcrypt with sufficient rounds
const hashedPassword = await bcrypt.hash(password, 12);

// ❌ BAD: Weak hashing
const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
```

---

## 8. Testing Standards

### 8.1 Unit Test Coverage

Aim for 80%+ code coverage for:
- Services
- Utils
- Middleware

**Test structure:**
```typescript
describe('BlogService', () => {
  describe('createPost', () => {
    it('should create post with valid data', async () => {
      // Arrange
      const postData = { title: 'Test', content: 'Content', categoryId: 1 };
      const userId = 1;

      // Act
      const result = await BlogService.createPost(postData, userId);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.title).toBe('Test');
      expect(result.authorId).toBe(userId);
    });

    it('should throw error for duplicate slug', async () => {
      // Arrange
      await BlogService.createPost({ title: 'Test', ... }, 1);

      // Act & Assert
      await expect(
        BlogService.createPost({ title: 'Test', ... }, 1)
      ).rejects.toThrow('URL slug already in use');
    });
  });
});
```

---

## 9. Performance Guidelines

### 9.1 Avoid Unnecessary Re-renders (React)

```typescript
// ✅ GOOD: Use React.memo for expensive components
export const PostList = React.memo<PostListProps>(({ posts }) => {
  // Component logic
});

// ✅ GOOD: Use useMemo for expensive calculations
const sortedPosts = useMemo(
  () => posts.sort((a, b) => b.createdAt - a.createdAt),
  [posts]
);

// ✅ GOOD: Use useCallback for event handlers
const handleClick = useCallback(
  (postId: number) => {
    onPostClick(postId);
  },
  [onPostClick]
);
```

---

### 9.2 Lazy Loading

```typescript
// ✅ GOOD: Lazy load routes
import { lazy, Suspense } from 'react';

const BlogList = lazy(() => import('./pages/blog/BlogList'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/blog" element={<BlogList />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 10. Git Practices

### 10.1 Commit Messages

```
feat(blog): add rich text editor to post form
fix(auth): resolve token expiration bug
docs(api): update blog endpoints documentation
refactor(services): extract common validation logic
test(blog): add unit tests for BlogService
chore(deps): update dependencies to latest versions
```

---

### 10.2 Branch Management

```bash
# Create feature branch
git checkout -b feature/blog-module

# Regular commits
git commit -m "feat(blog): add post list component"

# Before pushing, rebase on develop
git pull origin develop --rebase
git push origin feature/blog-module

# Create pull request on GitHub
```

---

**End of Coding Guidelines**