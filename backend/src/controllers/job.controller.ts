import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/job.service';
import { ApiError } from '../utils/ApiError';
import { validateId } from '../utils/validators';

/**
 * Get all job listings
 */
export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;
        const jobs = await jobService.getAllJobs(status as string);
        res.json({ success: true, data: jobs });
    } catch (error) {
        next(error);
    }
};

/**
 * Get job by ID
 */
export const getJobById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const job = await jobService.getJobById(validateId(id));
        res.json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

/**
 * Get job by Slug
 */
export const getJobBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const job = await jobService.getJobBySlug(slug);
        res.json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

/**
 * Create job listing
 */
export const createJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            title,
            department,
            location_city,
            location_type,
            employment_type,
            description,
            responsibilities,
            qualifications,
            benefits,
            salaryMin,
            salaryMax,
            salaryCurrency,
            applicationDeadline,
            status,
            internalNotes,
        } = req.body;

        if (!req.user) throw ApiError.unauthorized('User not authenticated');

        const job = await jobService.createJob({
            title,
            department,
            location_city,
            location_type,
            employment_type,
            description,
            responsibilities,
            qualifications,
            benefits,
            salaryMin,
            salaryMax,
            salaryCurrency,
            applicationDeadline,
            status: status || 'draft',
            internalNotes,
            postedBy: req.user.userId,
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

/**
 * Update job listing
 */
export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const {
            title,
            department,
            location_city,
            location_type,
            employment_type,
            description,
            responsibilities,
            qualifications,
            benefits,
            salaryMin,
            salaryMax,
            salaryCurrency,
            applicationDeadline,
            status,
            internalNotes,
        } = req.body;

        const job = await jobService.updateJob(validateId(id), {
            title,
            department,
            location_city,
            location_type,
            employment_type,
            description,
            responsibilities,
            qualifications,
            benefits,
            salaryMin,
            salaryMax,
            salaryCurrency,
            applicationDeadline,
            status,
            internalNotes,
        });

        res.json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete job listing
 */
export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await jobService.deleteJob(validateId(id));
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Submit job application
 */
export const submitApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // job ID
        const {
            applicantName,
            applicantEmail,
            applicantPhone,
            resumeUrl,
            resumeFilename,
            portfolioUrl,
            coverLetter,
        } = req.body;

        const application = await jobService.submitApplication({
            jobId: validateId(id),
            applicantName,
            applicantEmail,
            applicantPhone,
            resumeUrl,
            resumeFilename: resumeFilename || (resumeUrl ? resumeUrl.split('/').pop() : 'resume') || 'resume',
            portfolioUrl,
            coverLetter,
        });

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        next(error);
    }
};

/**
 * Get applications for a job
 */
export const getJobApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // job ID
        const applications = await jobService.getJobApplications(validateId(id));
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { applicationId } = req.params;
        const { status, notes } = req.body;

        const application = await jobService.updateApplicationStatus(validateId(applicationId), status, notes);
        res.json({ success: true, data: application });
    } catch (error) {
        next(error);
    }
};

/**
 * Get ALL applications
 */
export const getAllApplications = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const applications = await jobService.getAllApplications();
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
};
