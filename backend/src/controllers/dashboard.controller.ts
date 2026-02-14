import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await dashboardService.getStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};
