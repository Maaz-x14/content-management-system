import { User, BlogPost, PostStatus, JobListing, JobStatus, Service, ServiceStatus, JobApplication, MediaFile } from '../models';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

class DashboardService {
    /**
     * Get dashboard statistics
     */
    async getStats(role?: string) {
        try {
            const isViewer = role === 'viewer';

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
                // User stats - only for admin/editor
                !isViewer ? User.count() : Promise.resolve(0),
                // Post stats
                BlogPost.count(isViewer ? { where: { status: PostStatus.PUBLISHED } } : {}),
                // Service stats
                Service.count(),
                // Job stats
                JobListing.count(isViewer ? { where: { status: JobStatus.ACTIVE } } : {}),
                // Application stats - only for admin/editor
                !isViewer ? JobApplication.count() : Promise.resolve(0),
                // Media stats - only for admin/editor
                !isViewer ? MediaFile.count() : Promise.resolve(0),

                // Recent posts
                BlogPost.findAll({
                    where: isViewer ? { status: PostStatus.PUBLISHED } : {},
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'title', 'status', 'created_at'],
                    include: ['author'],
                }),

                // Recent jobs
                JobListing.findAll({
                    where: isViewer ? { status: JobStatus.ACTIVE } : {},
                    limit: 5,
                    order: [['created_at', 'DESC']],
                    attributes: ['id', 'title', 'status', 'created_at'],
                }),

                // Recent applications - only for admin/editor
                !isViewer ? JobApplication.findAll({
                    limit: 5,
                    order: [['applied_at', 'DESC']],
                    attributes: ['id', 'applicant_name', 'status', 'applied_at', 'job_id'],
                    include: [{ model: JobListing, as: 'job', attributes: ['title'] }],
                }) : Promise.resolve([]),
            ]);

            // Detailed counts
            const postCounts = await Promise.all([
                BlogPost.count({ where: { status: PostStatus.PUBLISHED } }),
                !isViewer ? BlogPost.count({ where: { status: PostStatus.DRAFT } }) : Promise.resolve(0),
            ]);

            const jobCounts = await Promise.all([
                JobListing.count({ where: { status: JobStatus.ACTIVE } }),
                !isViewer ? JobListing.count({ where: { status: JobStatus.CLOSED } }) : Promise.resolve(0),
            ]);

            const serviceCounts = await Promise.all([
                Service.count({ where: { status: ServiceStatus.COMPLETED } }),
                !isViewer ? Service.count({ where: { status: ServiceStatus.ONGOING } }) : Promise.resolve(0),
            ]);

            return {
                overview: {
                    totalUsers: users,
                    totalPosts: isViewer ? postCounts[0] : posts,
                    totalServices: services,
                    totalJobs: isViewer ? jobCounts[0] : jobs,
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

    async search(query: string) {
        if (!query || query.length < 2) return [];

        const [posts, services, jobs] = await Promise.all([
            BlogPost.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { content: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                limit: 5,
                attributes: ['id', 'title', 'slug']
            }),
            Service.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                limit: 5,
                attributes: ['id', 'title']
            }),
            JobListing.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                limit: 5,
                attributes: ['id', 'title', 'slug']
            })
        ]);

        const results = [
            ...posts.map(p => ({ id: p.id, title: p.title, type: 'post', link: `/posts?edit=${p.id}` })),
            ...services.map(s => ({ id: s.id, title: s.title, type: 'service', link: `/services` })),
            ...jobs.map(j => ({ id: j.id, title: j.title, type: 'job', link: `/careers` }))
        ];

        return results;
    }
}

export const dashboardService = new DashboardService();
