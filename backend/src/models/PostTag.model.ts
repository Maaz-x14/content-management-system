import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

// PostTag attributes interface (junction table)
export interface PostTagAttributes {
    post_id: number;
    tag_id: number;
    created_at?: Date;
}

// PostTag model class
export class PostTag extends Model<PostTagAttributes> implements PostTagAttributes {
    public post_id!: number;
    public tag_id!: number;

    public readonly created_at!: Date;
}

// Initialize PostTag model
PostTag.init(
    {
        post_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'blog_posts',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        tag_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'tags',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    },
    {
        sequelize,
        tableName: 'post_tags',
        underscored: true,
        timestamps: true,
        updatedAt: false, // Only created_at, no updated_at
        indexes: [
            {
                fields: ['post_id'],
            },
            {
                fields: ['tag_id'],
            },
        ],
    }
);
