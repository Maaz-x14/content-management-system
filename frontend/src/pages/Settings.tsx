import React from 'react';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">Full Name</label>
            <input 
              type="text" 
              value={user?.fullName || ''} 
              readOnly 
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-300 px-3 py-2 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Email Address</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              readOnly 
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-300 px-3 py-2 cursor-not-allowed"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-400">Role</label>
             <input
                type="text"
                value={typeof user?.role === 'object' ? user.role.name : user?.role || ''}
                readOnly
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-gray-300 px-3 py-2 cursor-not-allowed"
             />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Application Settings</h2>
        <p className="text-gray-400">Global application settings will be available here.</p>
      </div>
    </div>
  );
};

export default Settings;
