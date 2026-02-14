import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Tag attributes interface
export interface TagAttributes {
    id: number;
    name: string;
    slug: string;
    usage_count: number;
    created_at?: Date;
    updated_at?: Date;
}

// Optional attributes for creation
interface TagCreationAttributes extends Optional<TagAttributes, 'id' | 'usage_count'> { }

// Tag model class
export class Tag extends Model<TagAttributes, TagCreationAttributes> implements TagAttributes {
    public id!: number;
    public name!: string;
    public slug!: string;
    public usage_count!: number;

    public readonly created_at!: Date;
    public readonly updated_at!: Date;
}

// Initialize Tag model
Tag.init(
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
        usage_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'tags',
        underscored: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['slug'],
            },
            {
                fields: ['usage_count'],
            },
        ],
    }
);
