import { JobListing, JobStatus, EmploymentType, LocationType } from '../models/JobListing.model';
import { JobApplication, ApplicationStatus } from '../models/JobApplication.model';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/slugify';
import { Op } from 'sequelize';

interface JobListingData {
    title: string;
    department: string;
    location: string;
    employmentType: string;
    description: string;
    responsibilities?: string[];
    qualifications?: string[];
    benefits?: string[];
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    applicationDeadline?: Date;
    status: 'draft' | 'active' | 'closed';
    internalNotes?: string;
    postedBy: number;
}

interface UpdateJobData {
    title?: string;
    department?: string;
    location?: string;
    employmentType?: string;
    description?: string;
    responsibilities?: string[];
    qualifications?: string[];
    benefits?: string[];
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    applicationDeadline?: Date;
    status?: 'draft' | 'active' | 'closed';
    internalNotes?: string;
}

interface ApplicationData {
    jobId: number;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    resumeUrl: string;
    resumeFilename: string;
    portfolioUrl?: string;
    coverLetter?: string;
}

/**
 * Get all job listings
 */
export const getAllJobs = async (status?: string) => {
    const where: any = {};
    if (status) where.status = status;

    return JobListing.findAll({
        where,
        order: [['created_at', 'DESC']],
    });
};

/**
 * Get job by ID
 */
export const getJobById = async (id: number) => {
    const job = await JobListing.findByPk(id);
    if (!job) throw ApiError.notFound('Job listing not found');
    return job;
};

/**
 * Get job by Slug
 */
export const getJobBySlug = async (slug: string) => {
    const job = await JobListing.findOne({ where: { slug } });
    if (!job) throw ApiError.notFound('Job listing not found');
    return job;
};

/**
 * Create job listing
 */
export const createJob = async (data: JobListingData) => {
    const slug = generateSlug(data.title);

    const existingJob = await JobListing.findOne({ where: { slug } });
    if (existingJob) throw ApiError.conflict('A job with this title already exists');

    // Map string to enum
    let empType: EmploymentType = EmploymentType.FULL_TIME;
    if (Object.values(EmploymentType).includes(data.employmentType as EmploymentType)) {
        empType = data.employmentType as EmploymentType;
    }

    let jobStatus: JobStatus = JobStatus.DRAFT;
    if (Object.values(JobStatus).includes(data.status as JobStatus)) {
        jobStatus = data.status as JobStatus;
    }

    return JobListing.create({
        title: data.title,
        slug,
        department: data.department,
        location_type: LocationType.ONSITE,
        location_city: data.location,
        employment_type: empType,
        description: data.description,
        responsibilities: data.responsibilities || [],
        qualifications_required: data.qualifications || [],
        qualifications_preferred: [],
        benefits: data.benefits || [],
        salary_min: data.salaryMin,
        salary_max: data.salaryMax,
        salary_currency: data.salaryCurrency || 'USD',
        application_deadline: data.applicationDeadline,
        status: jobStatus,
        internal_notes: data.internalNotes,
        posted_by: data.postedBy,
        salary_visible: true,
    });
};

/**
 * Update job listing
 */
export const updateJob = async (id: number, data: UpdateJobData) => {
    const job = await JobListing.findByPk(id);
    if (!job) throw ApiError.notFound('Job listing not found');

    let slug = job.slug;
    if (data.title && data.title !== job.title) {
        slug = generateSlug(data.title);
        const existing = await JobListing.findOne({
            where: { slug, id: { [Op.ne]: id } }
        });
        if (existing) throw ApiError.conflict('A job with this title already exists');
    }

    // Handle enums
    let empType = job.employment_type;
    if (data.employmentType && Object.values(EmploymentType).includes(data.employmentType as EmploymentType)) {
        empType = data.employmentType as EmploymentType;
    }

    let jobStatus = job.status;
    if (data.status && Object.values(JobStatus).includes(data.status as JobStatus)) {
        jobStatus = data.status as JobStatus;
    }

    await job.update({
        title: data.title || job.title,
        slug,
        department: data.department || job.department,
        location_city: data.location !== undefined ? data.location : job.location_city,
        employment_type: empType,
        description: data.description || job.description,
        responsibilities: data.responsibilities || job.responsibilities,
        qualifications_required: data.qualifications || job.qualifications_required,
        benefits: data.benefits || job.benefits,
        salary_min: data.salaryMin !== undefined ? data.salaryMin : job.salary_min,
        salary_max: data.salaryMax !== undefined ? data.salaryMax : job.salary_max,
        salary_currency: data.salaryCurrency || job.salary_currency,
        application_deadline: data.applicationDeadline || job.application_deadline,
        status: jobStatus,
        internal_notes: data.internalNotes !== undefined ? data.internalNotes : job.internal_notes,
    });

    return job;
};

/**
 * Delete job listing
 */
export const deleteJob = async (id: number) => {
    const job = await JobListing.findByPk(id);
    if (!job) throw ApiError.notFound('Job listing not found');
    await job.destroy();
};

/**
 * Submit job application
 */
export const submitApplication = async (data: ApplicationData) => {
    const job = await JobListing.findByPk(data.jobId);
    if (!job) throw ApiError.notFound('Job listing not found');

    if (job.status !== JobStatus.ACTIVE) {
        throw ApiError.badRequest('This job is not accepting applications');
    }

    const existing = await JobApplication.findOne({
        where: {
            job_id: data.jobId,
            applicant_email: data.applicantEmail,
        },
    });

    if (existing) {
        throw ApiError.conflict('You have already applied for this position');
    }

    return JobApplication.create({
        job_id: data.jobId,
        applicant_name: data.applicantName,
        applicant_email: data.applicantEmail,
        applicant_phone: data.applicantPhone,
        resume_url: data.resumeUrl,
        resume_filename: data.resumeFilename,
        portfolio_url: data.portfolioUrl,
        cover_letter: data.coverLetter,
        status: ApplicationStatus.NEW,
    });
};

/**
 * Get applications for a job
 */
export const getJobApplications = async (jobId: number) => {
    const job = await JobListing.findByPk(jobId);
    if (!job) throw ApiError.notFound('Job listing not found');

    return JobApplication.findAll({
        where: { job_id: jobId },
        order: [['created_at', 'DESC']],
    });
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (id: number, status: string, notes?: string) => {
    const application = await JobApplication.findByPk(id);
    if (!application) throw ApiError.notFound('Application not found');

    let appStatus = application.status;
    if (Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
        appStatus = status as ApplicationStatus;
    }

    await application.update({
        status: appStatus,
        notes: notes || application.notes,
    });

    return application;
};
