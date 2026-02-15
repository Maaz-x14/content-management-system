import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import type { User } from './User.model';
import type { Category } from './Category.model';
import type { Tag } from './Tag.model';

// Blog post status enum
export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    SCHEDULED = 'scheduled',
    ARCHIVED = 'archived',
}

// BlogPost attributes interface
export interface BlogPostAttributes {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: PostStatus;
    featured_image: string | null;
    published_at: Date | null;
    scheduled_for: Date | null;
    author_id: number;
    category_id: number | null;
    view_count: number;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    canonical_url: string | null;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}

// Optional attributes for creation
interface BlogPostCreationAttributes
    extends Optional<
        BlogPostAttributes,
        | 'id'
        | 'excerpt'
        | 'featured_image'
        | 'published_at'
        | 'scheduled_for'
        | 'category_id'
        | 'view_count'
        | 'meta_title'
        | 'meta_description'
        | 'meta_keywords'
        | 'canonical_url'
    > { }

// BlogPost model class
export class BlogPost
    extends Model<BlogPostAttributes, BlogPostCreationAttributes>
    implements BlogPostAttributes {
    public id!: number;
    public title!: string;
    public slug!: string;
    public content!: string;
    public excerpt!: string | null;
    public status!: PostStatus;
    public featured_image!: string | null;
    public published_at!: Date | null;
    public scheduled_for!: Date | null;
    public author_id!: number;
    public category_id!: number | null;
    public view_count!: number;
    public meta_title!: string | null;
    public meta_description!: string | null;
    public meta_keywords!: string | null;
    public canonical_url!: string | null;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;

    // Association properties
    public readonly author?: User;
    public readonly category?: Category;
    public readonly tags?: Tag[];

    // Mixins
    public setTags!: (tags: number[] | Tag[]) => Promise<void>;
    public addTag!: (tag: number | Tag) => Promise<void>;
    public removeTag!: (tag: number | Tag) => Promise<void>;
    public getTags!: () => Promise<Tag[]>;

    public static associations: {
        author: Association<BlogPost, User>;
        category: Association<BlogPost, Category>;
        tags: Association<BlogPost, Tag>;
    };
}

// Initialize BlogPost model
BlogPost.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        excerpt: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(PostStatus)),
            allowNull: false,
            defaultValue: PostStatus.DRAFT,
        },
        featured_image: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        scheduled_for: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        author_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'categories',
                key: 'id',
            },
        },
        view_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        meta_title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        meta_description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        meta_keywords: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        canonical_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'blog_posts',
        underscored: true,
        timestamps: true,
        paranoid: true, // Soft delete
        indexes: [
            {
                unique: true,
                fields: ['slug'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['author_id'],
            },
            {
                fields: ['category_id'],
            },
            {
                fields: ['published_at'],
            },
            {
                fields: ['scheduled_for'],
            },
        ],
    }
);
