import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Role attributes interface
export interface RoleAttributes {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
}

// Optional attributes for creation
interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description'> { }

// Role model class
export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public description!: string | null;
    public permissions!: Record<string, any>;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// Initialize Role model
Role.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        slug: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        permissions: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
        },
    },
    {
        sequelize,
        tableName: 'roles',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['slug'],
            },
        ],
    }
);
