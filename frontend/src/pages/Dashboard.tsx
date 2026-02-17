import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
// import { Link } from 'react-router-dom';
import { Activity, Briefcase, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalPosts: number;
    totalServices: number;
    totalJobs: number;
    totalApplications: number;
    totalMedia: number;
  };
  breakdown: {
    posts: { published: number; draft: number };
    jobs: { active: number; closed: number };
    services: { published: number; draft: number };
  };
  recentActivity: {
    posts: Array<{ id: number; title: string; status: string; created_at: string; author: any }>;
    jobs: Array<{ id: number; title: string; status: string; created_at: string }>;
    applications: Array<{ id: number; applicant_name: string; status: string; applied_at: string; job?: { title: string } }>;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'super-admin' || user?.role === 'super_admin';
  const isViewer = user?.role === 'viewer';

  // Use React Query with auto-refresh
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data.data as DashboardStats;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const stats = data;

  // Flatten and sort recent activity
  const allActivity = React.useMemo(() => {
    if (!stats?.recentActivity) return [];
    
    const posts = (stats.recentActivity.posts || []).map(p => ({
      type: 'post',
      id: p.id,
      title: p.title,
      status: p.status,
      date: p.created_at,
      detail: `New post created by ${p.author?.full_name || 'Unknown'}`
    }));

    const jobs = (stats.recentActivity.jobs || []).map(j => ({
      type: 'job',
      id: j.id,
      title: j.title,
      status: j.status,
      date: j.created_at,
      detail: `New job listing created`
    }));

    const apps = (stats.recentActivity.applications || []).map(a => ({
      type: 'application',
      id: a.id,
      title: a.applicant_name,
      status: a.status,
      date: a.applied_at,
      detail: `Applied for ${a.job?.title || 'Unknown Job'}`
    }));

    return [...posts, ...jobs, ...apps].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ).slice(0, 10); // Show top 10 recent items
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-chassis">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-chassis min-h-screen">
        <p className="text-primary text-xl">Failed to load dashboard statistics.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-surface text-text-primary rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-chassis min-h-screen text-text-primary">
      <h1 className="text-3xl font-bold mb-8 text-white tracking-tight">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isAdmin && (
          <StatCard 
            label="Total Users" 
            value={stats?.overview.totalUsers || 0} 
            icon={<Activity className="w-5 h-5 text-primary-cyan" />}
            trend="Total Platform Users"
          />
        )}
        <StatCard 
          label="Published Posts" 
          value={stats?.overview.totalPosts || 0} 
          icon={<FileText className="w-5 h-5 text-primary" />}
          trend={!isViewer ? `${stats?.breakdown.posts.draft || 0} drafts pending` : undefined}
        />
        <StatCard 
          label="Active Jobs" 
          value={stats?.overview.totalJobs || 0} 
          icon={<Briefcase className="w-5 h-5 text-primary-cyan" />}
          trend={!isViewer ? `${stats?.breakdown.jobs.closed || 0} positions closed` : undefined}
        />
        {!isViewer && (
          <StatCard 
            label="Applications" 
            value={stats?.overview.totalApplications || 0} 
            icon={<CheckCircle className="w-5 h-5 text-success" />} // Using success green for applications
            trend="Candidates applied"
            isSuccess
          />
        )}
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-surface rounded-xl p-6 border border-gray-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success text-glow animate-pulse"></span>
             Live Updates
          </span>
        </div>

        {allActivity.length > 0 ? (
          <ul className="divide-y divide-gray-800">
            {allActivity.map((item, index) => (
              <li key={`${item.type}-${item.id}-${index}`} className="py-4 hover:bg-gray-800/30 transition-colors rounded-lg px-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={clsx(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      item.type === 'post' ? "bg-primary/10 text-primary" :
                      item.type === 'job' ? "bg-primary-cyan/10 text-primary-cyan" :
                      "bg-success/10 text-success"
                    )}>
                      {item.type === 'post' && <FileText className="w-5 h-5" />}
                      {item.type === 'job' && <Briefcase className="w-5 h-5" />}
                      {item.type === 'application' && <CheckCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.title}
                        <span className="mx-2 text-text-secondary/50">•</span>
                        <span className={clsx(
                          "text-xs uppercase tracking-wider font-semibold",
                          item.status === 'published' || item.status === 'active' || item.status === 'new' ? "text-success" :
                          item.status === 'draft' || item.status === 'interviewing' ? "text-yellow-500" :
                          "text-text-secondary"
                        )}>
                          {item.status}
                        </span>
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-text-secondary flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            <p>No recent activity recorded.</p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
             {/* Could add 'View All' links here if needed */}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode; trend?: string; isSuccess?: boolean }> = ({ label, value, icon, trend, isSuccess }) => (
  <div className="bg-surface p-6 rounded-xl shadow-lg border border-gray-800 hover:border-gray-700 transition-colors group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">{label}</p>
        <h3 className={clsx(
            "text-4xl font-bold mt-2 font-mono tabular-nums",
            isSuccess ? "text-success text-glow" : "text-white"
        )}>
          {value}
        </h3>
      </div>
      <div className="p-2 bg-chassis rounded-lg border border-gray-800 group-hover:border-gray-600 transition-colors">
        {icon}
      </div>
    </div>
    {trend && (
      <p className="text-xs text-text-secondary mt-2 flex items-center">
        {trend}
      </p>
    )}
  </div>
);

export default Dashboard;
