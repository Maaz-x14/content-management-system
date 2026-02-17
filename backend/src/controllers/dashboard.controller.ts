import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await dashboardService.getStats(req.user?.role);

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.q as string;
        const results = await dashboardService.search(query);

        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        next(error);
    }
};
