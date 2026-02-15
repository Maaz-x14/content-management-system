/**
 * Model Index - Central Model Registry and Association Definition
 * CRITICAL: All models MUST be imported and associated in this file.
 * To prevent EagerLoadingErrors in serverless environments, ensure 
 * associations are defined immediately upon module load.
 */

import { Role } from './Role.model';
import { User } from './User.model';
import { Category } from './Category.model';
import { Tag } from './Tag.model';
import { BlogPost, PostStatus } from './BlogPost.model';
import { PostTag } from './PostTag.model';
import { Service, ServiceStatus } from './Service.model';
import { ServiceImage } from './ServiceImage.model';
import { JobListing, JobStatus, EmploymentType, LocationType } from './JobListing.model';
import { JobApplication, ApplicationStatus } from './JobApplication.model';
import { MediaFile, FileType } from './MediaFile.model';

// ============================================
// DEFINE ASSOCIATIONS
// ============================================
// We wrap this to ensure it runs exactly once 
// and can be re-called if needed during hot-reloads
export const initModelAssociations = () => {
    console.log('🔄 [Sequelize] Initializing Model Associations...');

    // User <-> Role (Many-to-One)
    User.belongsTo(Role, {
        foreignKey: 'role_id',
        as: 'role',
    });
    Role.hasMany(User, {
        foreignKey: 'role_id',
        as: 'users',
    });

    // Category <-> Category (Self-referencing for hierarchical categories)
    Category.belongsTo(Category, {
        foreignKey: 'parent_id',
        as: 'parent',
    });
    Category.hasMany(Category, {
        foreignKey: 'parent_id',
        as: 'children',
    });

    // BlogPost <-> User (Many-to-One for author)
    BlogPost.belongsTo(User, {
        foreignKey: 'author_id',
        as: 'author',
    });
    User.hasMany(BlogPost, {
        foreignKey: 'author_id',
        as: 'blog_posts',
    });

    // BlogPost <-> Category (Many-to-One)
    BlogPost.belongsTo(Category, {
        foreignKey: 'category_id',
        as: 'category',
    });
    Category.hasMany(BlogPost, {
        foreignKey: 'category_id',
        as: 'blog_posts',
    });

    // BlogPost <-> Tag (Many-to-Many through PostTag)
    BlogPost.belongsToMany(Tag, {
        through: PostTag,
        foreignKey: 'post_id',
        otherKey: 'tag_id',
        as: 'tags',
    });
    Tag.belongsToMany(BlogPost, {
        through: PostTag,
        foreignKey: 'tag_id',
        otherKey: 'post_id',
        as: 'blog_posts',
    });

    // Service <-> User (Many-to-One for creator)
    Service.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator',
    });
    User.hasMany(Service, {
        foreignKey: 'created_by',
        as: 'services',
    });

    // Service <-> ServiceImage (One-to-Many)
    Service.hasMany(ServiceImage, {
        foreignKey: 'service_id',
        as: 'images',
    });
    ServiceImage.belongsTo(Service, {
        foreignKey: 'service_id',
        as: 'service',
    });

    // JobListing <-> User (Many-to-One for poster)
    JobListing.belongsTo(User, {
        foreignKey: 'posted_by',
        as: 'poster',
    });
    User.hasMany(JobListing, {
        foreignKey: 'posted_by',
        as: 'job_listings',
    });

    // JobListing <-> JobApplication (One-to-Many)
    JobListing.hasMany(JobApplication, {
        foreignKey: 'job_id',
        as: 'applications',
    });
    JobApplication.belongsTo(JobListing, {
        foreignKey: 'job_id',
        as: 'job',
    });

    // MediaFile <-> User (Many-to-One for uploader)
    MediaFile.belongsTo(User, {
        foreignKey: 'uploaded_by',
        as: 'uploader',
    });
    User.hasMany(MediaFile, {
        foreignKey: 'uploaded_by',
        as: 'uploaded_files',
    });

    console.log('✅ [Sequelize] Associations registered successfully');
};

// Execute associations IMMEDIATELY upon module load
initModelAssociations();

// ============================================
// EXPORTS
// ============================================

export {
    Role,
    User,
    Category,
    Tag,
    BlogPost,
    PostStatus,
    PostTag,
    Service,
    ServiceStatus,
    ServiceImage,
    JobListing,
    JobStatus,
    EmploymentType,
    LocationType,
    JobApplication,
    ApplicationStatus,
    MediaFile,
    FileType,
};

// Default export for convenience
export default {
    Role,
    User,
    Category,
    Tag,
    BlogPost,
    PostTag,
    Service,
    ServiceImage,
    JobListing,
    JobApplication,
    MediaFile,
};
