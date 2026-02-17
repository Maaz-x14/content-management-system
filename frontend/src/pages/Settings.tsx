import React from 'react';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </span>
            Profile Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input 
                type="text" 
                value={user?.fullName || ''} 
                readOnly 
                className="block w-full rounded-lg bg-gray-900 border-gray-700 text-gray-300 px-4 py-2.5 cursor-not-allowed focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                readOnly 
                className="block w-full rounded-lg bg-gray-900 border-gray-700 text-gray-300 px-4 py-2.5 cursor-not-allowed focus:ring-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Assigned Role</label>
              <div className="mt-1 flex items-center">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                  {typeof user?.role === 'object' ? user.role.name : user?.role || 'Guest'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </span>
            Security
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400 mb-4">Manage your account security and password preferences.</p>
              <button className="w-full sm:w-auto px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors border border-gray-600">
                Change Password
              </button>
            </div>
            <div className="pt-6 border-t border-gray-700">
              <h3 className="text-sm font-medium text-white mb-2">Two-Factor Authentication</h3>
              <p className="text-xs text-gray-500 mb-4">Add an extra layer of security to your account by enabling 2FA.</p>
              <button disabled className="text-indigo-400 hover:text-indigo-300 text-sm font-medium opacity-50 cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl lg:col-span-2">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            System Status
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">API Server</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
              <p className="text-lg font-bold text-white uppercase tracking-tight">Operational</p>
              <p className="text-[10px] text-gray-500 mt-1">Latency: 42ms</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Database</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
              <p className="text-lg font-bold text-white uppercase tracking-tight">Connected</p>
              <p className="text-[10px] text-gray-500 mt-1">Pool: 12/20 active</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-400">Storage (Multer)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              </div>
              <p className="text-lg font-bold text-white uppercase tracking-tight">Active</p>
              <p className="text-[10px] text-gray-500 mt-1">Used: 234MB / 10GB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
