import multer from 'multer';

import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

// Allow memory storage to process files with Sharp before saving
const storage = multer.memoryStorage();

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        // Images
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'text/plain',
        'text/csv',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(ApiError.badRequest(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`));
    }
};

// Max file size: 10MB
const limits = {
    fileSize: 10 * 1024 * 1024,
};

export const upload = multer({
    storage,
    fileFilter,
    limits,
});
