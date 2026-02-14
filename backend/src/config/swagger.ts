import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Morphe Labs CMS API',
            version: '1.0.0',
            description: 'API documentation for Morphe Labs Headless CMS',
            contact: {
                name: 'Morphe Labs Support',
                email: 'support@morphelabs.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001/api/v1',
                description: 'Development server',
            },
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Fallback Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            default: false,
                        },
                        error: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                },
                                message: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User management endpoints' },
            { name: 'Blog', description: 'Blog post management' },
            { name: 'Categories', description: 'Category management' },
            { name: 'Tags', description: 'Tag management' },
            { name: 'Services', description: 'Portfolio/Service management' },
            { name: 'Careers', description: 'Job listing and application management' },
        ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
