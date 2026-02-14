import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { Service } from './Service.model';

// ServiceImage attributes interface
export interface ServiceImageAttributes {
    id: number;
    service_id: number;
    image_url: string;
    caption: string | null;
    is_primary: boolean;
    display_order: number;
    created_at?: Date;
    updated_at?: Date;
}

// Optional attributes for creation
interface ServiceImageCreationAttributes
    extends Optional<ServiceImageAttributes, 'id' | 'caption' | 'is_primary' | 'display_order'> { }

// ServiceImage model class
export class ServiceImage
    extends Model<ServiceImageAttributes, ServiceImageCreationAttributes>
    implements ServiceImageAttributes {
    public id!: number;
    public service_id!: number;
    public image_url!: string;
    public caption!: string | null;
    public is_primary!: boolean;
    public display_order!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Association properties
    public readonly service?: Service;

    public static associations: {
        service: Association<ServiceImage, Service>;
    };
}

// Initialize ServiceImage model
ServiceImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        service_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'services',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        image_url: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        caption: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_primary: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        display_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'service_images',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                fields: ['service_id'],
            },
            {
                fields: ['is_primary'],
            },
            {
                fields: ['display_order'],
            },
        ],
    }
);
