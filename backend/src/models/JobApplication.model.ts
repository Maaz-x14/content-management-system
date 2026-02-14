import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { JobListing } from './JobListing.model';

// Application status enum
export enum ApplicationStatus {
    NEW = 'new',
    REVIEWING = 'reviewing',
    SHORTLISTED = 'shortlisted',
    INTERVIEWING = 'interviewing',
    OFFERED = 'offered',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
}

// JobApplication attributes interface
export interface JobApplicationAttributes {
    id: number;
    job_id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    resume_url: string;
    resume_filename: string;
    cover_letter: string | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    status: ApplicationStatus;
    notes: string | null;
    applied_at: Date;
    updated_at?: Date;
}

// Optional attributes for creation
interface JobApplicationCreationAttributes
    extends Optional<
        JobApplicationAttributes,
        | 'id'
        | 'applicant_phone'
        | 'cover_letter'
        | 'linkedin_url'
        | 'portfolio_url'
        | 'status'
        | 'notes'
        | 'applied_at'
    > { }

// JobApplication model class
export class JobApplication
    extends Model<JobApplicationAttributes, JobApplicationCreationAttributes>
    implements JobApplicationAttributes {
    public id!: number;
    public job_id!: number;
    public applicant_name!: string;
    public applicant_email!: string;
    public applicant_phone!: string | null;
    public resume_url!: string;
    public resume_filename!: string;
    public cover_letter!: string | null;
    public linkedin_url!: string | null;
    public portfolio_url!: string | null;
    public status!: ApplicationStatus;
    public notes!: string | null;

    public readonly applied_at!: Date;
    public readonly updated_at!: Date;

    // Association properties
    public readonly job?: JobListing;

    public static associations: {
        job: Association<JobApplication, JobListing>;
    };
}

// Initialize JobApplication model
JobApplication.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        job_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'job_listings',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        applicant_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        applicant_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        applicant_phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        resume_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        resume_filename: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        cover_letter: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        linkedin_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        portfolio_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
            allowNull: false,
            defaultValue: ApplicationStatus.NEW,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        applied_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'job_applications',
        underscored: true,
        timestamps: true,
        createdAt: 'applied_at',
        indexes: [
            {
                fields: ['job_id'],
            },
            {
                fields: ['status'],
            },
            {
                fields: ['applicant_email'],
            },
            {
                fields: ['applied_at'],
            },
        ],
    }
);
