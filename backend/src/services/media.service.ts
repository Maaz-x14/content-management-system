import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import sharp from 'sharp';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { MediaFile, FileType } from '../models/MediaFile.model';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

class MediaService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(__dirname, '../../uploads');

        // Ensure upload directory exists
        if (!fsSync.existsSync(this.uploadDir)) {
            fsSync.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Determine file type category based on MIME type
     */
    private getFileType(mimeType: string): FileType {
        if (mimeType.startsWith('image/')) return FileType.IMAGE;
        if (mimeType.startsWith('video/')) return FileType.VIDEO;
        if (
            mimeType.includes('pdf') ||
            mimeType.includes('document') ||
            mimeType.includes('sheet') ||
            mimeType.includes('text/') ||
            mimeType.includes('msword')
        )
            return FileType.DOCUMENT;
        return FileType.OTHER;
    }

    /**
     * Process and save uploaded file
     */
    async processUpload(file: Express.Multer.File, userId: number, altText?: string): Promise<MediaFile> {
        try {
            const fileType = this.getFileType(file.mimetype);
            const originalName = file.originalname;
            const ext = path.extname(originalName).toLowerCase();
            const nameWithoutExt = path.basename(originalName, ext);

            // Create safe filename
            const safeName = slugify(nameWithoutExt, { lower: true, strict: true });
            const uniqueFilename = `${safeName}-${uuidv4().substring(0, 8)}${ext}`;
            const diskPath = path.join(this.uploadDir, uniqueFilename);
            const fileUrl = `/uploads/${uniqueFilename}`;

            let width = null;
            let height = null;
            let finalSize = file.size;
            let thumbnailUrl = null;

            if (fileType === FileType.IMAGE && file.mimetype !== 'image/svg+xml') {
                // Determine image metadata
                const metadata = await sharp(file.buffer).metadata();
                width = metadata.width || null;
                height = metadata.height || null;

                // Create optimized version (max width 1920) if larger
                let pipeline = sharp(file.buffer);
                if (width && width > 1920) {
                    pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
                }

                // If JPEG/PNG, optimize quality
                if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
                    pipeline = pipeline.jpeg({ quality: 85 });
                } else if (file.mimetype === 'image/png') {
                    pipeline = pipeline.png({ compressionLevel: 8 });
                } else if (file.mimetype === 'image/webp') {
                    pipeline = pipeline.webp({ quality: 80 });
                }

                await pipeline.toFile(diskPath);

                // Get optimized file size
                const stats = await fs.stat(diskPath);
                finalSize = stats.size;

                // Create thumbnail (300px width)
                const thumbFilename = `thumb_${uniqueFilename}`;
                const thumbPath = path.join(this.uploadDir, thumbFilename);
                thumbnailUrl = `/uploads/${thumbFilename}`;

                await sharp(file.buffer)
                    .resize(300, 300, { fit: 'cover', position: 'center' })
                    .toFile(thumbPath);

                // Update dimensions if resized
                const finalMeta = await sharp(diskPath).metadata();
                width = finalMeta.width || null;
                height = finalMeta.height || null;
            } else {
                // Just save the file
                await fs.writeFile(diskPath, file.buffer);
            }

            // Save to database
            const mediaFile = await MediaFile.create({
                filename: uniqueFilename,
                original_name: originalName,
                file_path: diskPath,
                file_url: fileUrl,
                thumbnail_url: thumbnailUrl,
                file_type: fileType,
                mime_type: file.mimetype,
                file_size: finalSize,
                image_width: width,
                image_height: height,
                alt_text: altText || null,
                uploaded_by: userId,
            });

            return mediaFile;
        } catch (error) {
            logger.error('File upload processing failed:', error);
            throw ApiError.internal('Failed to process uploaded file');
        }
    }

    /**
     * Get all media files with optional filtering
     */
    async getAllMedia(
        page = 1,
        limit = 20,
        type?: FileType,
        search?: string
    ): Promise<{ files: MediaFile[]; total: number; totalPages: number }> {
        const offset = (page - 1) * limit;
        const where: any = {};

        if (type) {
            where.file_type = type;
        }

        // Search in filename or alt_text
        if (search) {
            const { Op } = require('sequelize'); // Import locally to avoid top-level require if not needed globally yet
            where[Op.or] = [
                { original_name: { [Op.iLike]: `%${search}%` } },
                { alt_text: { [Op.iLike]: `%${search}%` } },
                { filename: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await MediaFile.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        return {
            files: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
        };
    }

    /**
     * Get media by ID
     */
    async getMediaById(id: number): Promise<MediaFile> {
        const media = await MediaFile.findByPk(id);
        if (!media) throw ApiError.notFound('Media file not found');
        return media;
    }

    /**
     * Update media details (alt text)
     */
    async updateMedia(id: number, altText: string): Promise<MediaFile> {
        const media = await this.getMediaById(id);
        media.alt_text = altText;
        await media.save();
        return media;
    }

    /**
     * Delete media file
     */
    async deleteMedia(id: number): Promise<void> {
        const media = await this.getMediaById(id);

        // Remove from disk (even with soft delete, usually we keep files. 
        // But if hard delete is requested, we remove.
        // For now, implementing soft delete on DB, so keep file on disk.
        // Wait, standard practice: if soft deleted in DB, keep file. 
        // If hard delete, remove file.
        // The implementation below performs standard soft-delete on model.)

        await media.destroy();
    }
}

export const mediaService = new MediaService();
