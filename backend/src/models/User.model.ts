import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';
import { Role } from './Role.model';

// User attributes interface
export interface UserAttributes {
    id: number;
    email: string;
    password_hash: string;
    full_name: string;
    role_id: number;
    is_active: boolean;
    last_login: Date | null;
    password_reset_token: string | null;
    password_reset_expires: Date | null;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}

// Optional attributes for creation
interface UserCreationAttributes
    extends Optional<
        UserAttributes,
        'id' | 'is_active' | 'last_login' | 'password_reset_token' | 'password_reset_expires'
    > { }

// User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public email!: string;
    public password_hash!: string;
    public full_name!: string;
    public role_id!: number;
    public is_active!: boolean;
    public last_login!: Date | null;
    public password_reset_token!: string | null;
    public password_reset_expires!: Date | null;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
    public readonly deleted_at!: Date | null;

    // Association properties
    public readonly role?: Role;

    public static associations: {
        role: Association<User, Role>;
    };
}

// Initialize User model
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id',
            },
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        password_reset_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        password_reset_expires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'users',
        underscored: true,
        timestamps: true,
        paranoid: true, // Soft delete
        indexes: [
            {
                unique: true,
                fields: ['email'],
            },
            {
                fields: ['role_id'],
            },
            {
                fields: ['is_active'],
            },
        ],
    }
);
