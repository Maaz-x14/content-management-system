import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User.model';

// File type enum
export enum FileType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    VIDEO = 'video',
    OTHER = 'other',
}

// MediaFile attributes interface
export interface MediaFileAttributes {
    id: number;
    filename: string;
    original_name: string;
    file_path: string;
    file_url: string;
    thumbnail_url: string | null;
    file_type: FileType;
    mime_type: string;
    file_size: number;
    image_width: number | null;
    image_height: number | null;
    alt_text: string | null;
    uploaded_by: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}

// Optional attributes for creation
interface MediaFileCreationAttributes
    extends Optional<
        MediaFileAttributes,
        'id' | 'thumbnail_url' | 'image_width' | 'image_height' | 'alt_text'
    > { }

// MediaFile model class
export class MediaFile
    extends Model<MediaFileAttributes, MediaFileCreationAttributes>
    implements MediaFileAttributes {
    public id!: number;
    public filename!: string;
    public original_name!: string;
    public file_path!: string;
    public file_url!: string;
    public thumbnail_url!: string | null;
    public file_type!: FileType;
    public mime_type!: string;
    public file_size!: number;
    public image_width!: number | null;
    public image_height!: number | null;
    public alt_text!: string | null;
    public uploaded_by!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;

    // Association properties
    public readonly uploader?: User;

    public static associations: {
        uploader: Association<MediaFile, User>;
    };
}

// Initialize MediaFile model
MediaFile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        original_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        file_path: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        file_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        thumbnail_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        file_type: {
            type: DataTypes.ENUM(...Object.values(FileType)),
            allowNull: false,
        },
        mime_type: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        image_width: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        image_height: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        alt_text: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        uploaded_by: {
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
        tableName: 'media_files',
        underscored: true,
        timestamps: true,
        paranoid: true, // Soft delete
        indexes: [
            {
                unique: true,
                fields: ['filename'],
            },
            {
                fields: ['file_type'],
            },
            {
                fields: ['uploaded_by'],
            },
            {
                fields: ['created_at'],
            },
        ],
    }
);
