import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import type { User } from './User.model';
import type { ServiceImage } from './ServiceImage.model';

// Service status enum
export enum ServiceStatus {
    COMPLETED = 'completed',
    ONGOING = 'ongoing',
    ARCHIVED = 'archived',
}

// Service attributes interface
export interface ServiceAttributes {
    id: number;
    title: string;
    slug: string;
    description: string;
    client_name: string | null;
    project_url: string | null;
    project_date: Date | null;
    project_duration: string | null;
    status: ServiceStatus;
    featured: boolean;
    category: string | null;
    technologies: string[];
    industry: string | null;
    challenge: string | null;
    solution: string | null;
    results: string | null;
    metrics: Record<string, any> | null;
    created_by: number;
    display_order: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}

// Optional attributes for creation
interface ServiceCreationAttributes
    extends Optional<
        ServiceAttributes,
        | 'id'
        | 'client_name'
        | 'project_url'
        | 'project_date'
        | 'project_duration'
        | 'featured'
        | 'category'
        | 'technologies'
        | 'industry'
        | 'challenge'
        | 'solution'
        | 'results'
        | 'metrics'
        | 'display_order'
    > { }

// Service model class
export class Service
    extends Model<ServiceAttributes, ServiceCreationAttributes>
    implements ServiceAttributes {
    public id!: number;
    public title!: string;
    public slug!: string;
    public description!: string;
    public client_name!: string | null;
    public project_url!: string | null;
    public project_date!: Date | null;
    public project_duration!: string | null;
    public status!: ServiceStatus;
    public featured!: boolean;
    public category!: string | null;
    public technologies!: string[];
    public industry!: string | null;
    public challenge!: string | null;
    public solution!: string | null;
    public results!: string | null;
    public metrics!: Record<string, any> | null;
    public created_by!: number;
    public display_order!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;

    // Association properties
    public readonly creator?: User;
    public readonly images?: ServiceImage[];

    public static associations: {
        creator: Association<Service, User>;
        images: Association<Service, ServiceImage>;
    };
}

// Initialize Service model
Service.init(
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
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        client_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        project_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        project_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        project_duration: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ServiceStatus)),
            allowNull: false,
            defaultValue: ServiceStatus.ONGOING,
        },
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        technologies: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            allowNull: false,
            defaultValue: [],
        },
        industry: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        challenge: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        solution: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        results: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        metrics: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        display_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'services',
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
                fields: ['featured'],
            },
            {
                fields: ['created_by'],
            },
            {
                fields: ['display_order'],
            },
        ],
    }
);
