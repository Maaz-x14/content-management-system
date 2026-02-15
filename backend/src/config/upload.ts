import path from 'path';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.development' });
}

export const uploadConfig = {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
    allowedDocumentTypes: (
        process.env.ALLOWED_DOCUMENT_TYPES ||
        'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ).split(','),

    // Paths
    imagePath: path.join(process.env.UPLOAD_DIR || './uploads', 'images'),
    documentPath: path.join(process.env.UPLOAD_DIR || './uploads', 'documents'),
    tempPath: path.join(process.env.UPLOAD_DIR || './uploads', 'temp'),

    // Image processing
    imageQuality: 80,
    thumbnailWidth: 300,
    thumbnailHeight: 300,
};
