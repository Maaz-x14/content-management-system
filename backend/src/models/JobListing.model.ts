import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User.model';
import { JobApplication } from './JobApplication.model';

// Job listing status enum
export enum JobStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    CLOSED = 'closed',
    ARCHIVED = 'archived',
}

// Location type enum
export enum LocationType {
    ONSITE = 'onsite',
    REMOTE = 'remote',
    HYBRID = 'hybrid',
}

// Employment type enum
export enum EmploymentType {
    FULL_TIME = 'full-time',
    PART_TIME = 'part-time',
    CONTRACT = 'contract',
    INTERNSHIP = 'internship',
}

// JobListing attributes interface
export interface JobListingAttributes {
    id: number;
    title: string;
    slug: string;
    department: string;
    location_type: LocationType;
    location_city: string | null;
    location_region: string | null;
    remote_policy: string | null;
    employment_type: EmploymentType;
    description: string;
    responsibilities: string[];
    qualifications_required: string[];
    qualifications_preferred: string[];
    benefits: string[];
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    salary_visible: boolean;
    application_deadline: Date | null;
    status: JobStatus;
    internal_notes: string | null;
    posted_by: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}

// Optional attributes for creation
interface JobListingCreationAttributes
    extends Optional<
        JobListingAttributes,
        | 'id'
        | 'location_city'
        | 'location_region'
        | 'remote_policy'
        | 'responsibilities'
        | 'qualifications_required'
        | 'qualifications_preferred'
        | 'benefits'
        | 'salary_min'
        | 'salary_max'
        | 'salary_currency'
        | 'salary_visible'
        | 'application_deadline'
        | 'internal_notes'
    > { }

// JobListing model class
export class JobListing
    extends Model<JobListingAttributes, JobListingCreationAttributes>
    implements JobListingAttributes {
    public id!: number;
    public title!: string;
    public slug!: string;
    public department!: string;
    public location_type!: LocationType;
    public location_city!: string | null;
    public location_region!: string | null;
    public remote_policy!: string | null;
    public employment_type!: EmploymentType;
    public description!: string;
    public responsibilities!: string[];
    public qualifications_required!: string[];
    public qualifications_preferred!: string[];
    public benefits!: string[];
    public salary_min!: number | null;
    public salary_max!: number | null;
    public salary_currency!: string;
    public salary_visible!: boolean;
    public application_deadline!: Date | null;
    public status!: JobStatus;
    public internal_notes!: string | null;
    public posted_by!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;

    // Association properties
    public readonly poster?: User;
    public readonly applications?: JobApplication[];

    public static associations: {
        poster: Association<JobListing, User>;
        applications: Association<JobListing, JobApplication>;
    };
}

// Initialize JobListing model
JobListing.init(
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
        department: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        location_type: {
            type: DataTypes.ENUM(...Object.values(LocationType)),
            allowNull: false,
        },
        location_city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        location_region: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        remote_policy: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        employment_type: {
            type: DataTypes.ENUM(...Object.values(EmploymentType)),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        responsibilities: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        qualifications_required: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        qualifications_preferred: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        benefits: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        salary_min: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        salary_max: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        salary_currency: {
            type: DataTypes.STRING(3),
            allowNull: false,
            defaultValue: 'USD',
        },
        salary_visible: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        application_deadline: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(JobStatus)),
            allowNull: false,
            defaultValue: JobStatus.DRAFT,
        },
        internal_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        posted_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'job_listings',
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
                fields: ['department'],
            },
            {
                fields: ['location_type'],
            },
            {
                fields: ['employment_type'],
            },
            {
                fields: ['posted_by'],
            },
            {
                fields: ['application_deadline'],
            },
        ],
    }
);
