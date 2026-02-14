import React, { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

interface Activity {
    id: number;
    applicant_name: string;
    status: string;
    applied_at: string;
    job_id: number;
    job?: {
        id: number;
        title: string;
    };
}

const Dashboard: React.FC = () => {
  // const { user } = useAuth(); // Unused
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Loading stats...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?.overview?.users || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium">Total Posts</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?.overview?.posts || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium">Job Applications</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?.overview?.applications || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h3 className="text-gray-400 text-sm font-medium">Media Files</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?.overview?.mediaFiles || 0}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        {stats?.recentActivity?.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {stats.recentActivity.map((activity: Activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                        {activity.applicant_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.applicant_name} applied for <span className="text-indigo-400">{activity.job?.title}</span>
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {new Date(activity.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'new' ? 'bg-green-100 text-green-800' :
                      activity.status === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No recent activity.</p>
        )}
        <div className="mt-4">
            <Link to="/careers" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">View all applications &rarr;</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
