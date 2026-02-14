import { Model, DataTypes, Optional, Association } from 'sequelize';
import { sequelize } from '../config/database';

// Category attributes interface
export interface CategoryAttributes {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    parent_id: number | null;
    display_order: number;
    created_at?: Date;
    updated_at?: Date;
}

// Optional attributes for creation
interface CategoryCreationAttributes
    extends Optional<CategoryAttributes, 'id' | 'description' | 'parent_id' | 'display_order'> { }

// Category model class
export class Category
    extends Model<CategoryAttributes, CategoryCreationAttributes>
    implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public description!: string | null;
    public parent_id!: number | null;
    public display_order!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    // Association properties
    public readonly parent?: Category;
    public readonly children?: Category[];

    public static associations: {
        parent: Association<Category, Category>;
        children: Association<Category, Category>;
    };
}

// Initialize Category model
Category.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'categories',
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
        tableName: 'categories',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['slug'],
            },
            {
                fields: ['parent_id'],
            },
            {
                fields: ['display_order'],
            },
        ],
    }
);
