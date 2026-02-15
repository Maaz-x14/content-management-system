import { User, BlogPost, PostStatus, JobListing, JobStatus, Service, ServiceStatus, JobApplication, MediaFile } from '../models';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

class DashboardService {
    /**
     * Get dashboard statistics
     */
    async getStats() {
        try {
            const [
                users,
                posts,
                services,
                jobs,
                applications,
                mediaFiles,
                recentPosts,
                recentJobs,
                recentApplications
            ] = await Promise.all([
                // User stats
                User.count(),
                // Post stats
                BlogPost.count(),
                // Service stats
                Service.count(),
                // Job stats
                JobListing.count(),
                // Application stats
                JobApplication.count(),
                // Media stats
                MediaFile.count(),

                // Recent posts
                BlogPost.findAll({
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'title', 'status', 'created_at'],
                    include: ['author'],
                }),

                // Recent jobs
                JobListing.findAll({
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'title', 'status', 'created_at'],
                }),

                // Recent applications
                JobApplication.findAll({
                    limit: 5,
                    order: [['applied_at', 'DESC']],
                    attributes: ['id', 'applicant_name', 'status', 'applied_at', 'job_id'],
                    include: [{ model: JobListing, as: 'job', attributes: ['title'] }],
                }),
            ]);

            // Detailed counts
            const postCounts = await Promise.all([
                BlogPost.count({ where: { status: PostStatus.PUBLISHED } }),
                BlogPost.count({ where: { status: PostStatus.DRAFT } }),
            ]);

            const jobCounts = await Promise.all([
                JobListing.count({ where: { status: JobStatus.ACTIVE } }),
                JobListing.count({ where: { status: JobStatus.CLOSED } }),
            ]);

            const serviceCounts = await Promise.all([
                Service.count({ where: { status: ServiceStatus.PUBLISHED } }),
                Service.count({ where: { status: ServiceStatus.DRAFT } }),
            ]);

            return {
                overview: {
                    totalUsers: users,
                    totalPosts: posts,
                    totalServices: services,
                    totalJobs: jobs,
                    totalApplications: applications,
                    totalMedia: mediaFiles,
                },
                breakdown: {
                    posts: {
                        published: postCounts[0],
                        draft: postCounts[1],
                    },
                    jobs: {
                        active: jobCounts[0],
                        closed: jobCounts[1],
                    },
                    services: {
                        published: serviceCounts[0],
                        draft: serviceCounts[1],
                    },
                },
                recentActivity: {
                    posts: recentPosts,
                    jobs: recentJobs,
                    applications: recentApplications,
                },
            };
        } catch (error) {
            logger.error('Failed to fetch dashboard stats:', error);
            throw ApiError.internal('Failed to fetch dashboard statistics');
        }
    }
}

export const dashboardService = new DashboardService();
