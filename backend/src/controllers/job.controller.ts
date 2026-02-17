import { Request, Response, NextFunction } from 'express';
import * as jobService from '../services/job.service';
import { ApiError } from '../utils/ApiError';
import { validateId } from '../utils/validators';

/**
 * Get all job listings
 */
export const getAllJobs = async (req: Request, res: Response, _next: NextFunction) => {
    const { status } = req.query;
    const jobs = await jobService.getAllJobs(status as string);
    res.json({ success: true, data: jobs });
};

/**
 * Get job by ID
 */
export const getJobById = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const job = await jobService.getJobById(validateId(id));
    res.json({ success: true, data: job });
};

/**
 * Get job by Slug
 */
export const getJobBySlug = async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;
    const job = await jobService.getJobBySlug(slug);
    res.json({ success: true, data: job });
};

/**
 * Create job listing
 */
export const createJob = async (req: Request, res: Response, _next: NextFunction) => {
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
};

/**
 * Update job listing
 */
export const updateJob = async (req: Request, res: Response, _next: NextFunction) => {
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
};

/**
 * Delete job listing
 */
export const deleteJob = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await jobService.deleteJob(validateId(id));
    res.json({ success: true, message: 'Job deleted successfully' });
};

/**
 * Submit job application
 */
export const submitApplication = async (req: Request, res: Response, _next: NextFunction) => {
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
        resumeFilename: resumeFilename || resumeUrl.split('/').pop() || 'resume',
        portfolioUrl,
        coverLetter,
    });

    res.status(201).json({ success: true, data: application });
};

/**
 * Get applications for a job
 */
export const getJobApplications = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params; // job ID
    const applications = await jobService.getJobApplications(validateId(id));
    res.json({ success: true, data: applications });
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (req: Request, res: Response, _next: NextFunction) => {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await jobService.updateApplicationStatus(validateId(applicationId), status, notes);
    res.json({ success: true, data: application });
};

/**
 * Get ALL applications
 */
export const getAllApplications = async (_req: Request, res: Response, _next: NextFunction) => {
    const applications = await jobService.getAllApplications();
    res.json({ success: true, data: applications });
};
