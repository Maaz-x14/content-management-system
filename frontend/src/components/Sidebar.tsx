import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Briefcase, 
  Image, 
  LayoutDashboard, 
  Settings, 
  X,
  ClipboardList
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  const isViewer = user?.role === 'viewer';
  
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/posts', label: 'Blog Posts', icon: FileText },
    { to: '/services', label: 'Services', icon: Settings }, 
    { to: '/careers', label: 'Careers', icon: Briefcase },
    ...(!isViewer ? [{ to: '/applications', label: 'Applications', icon: ClipboardList }] : []),
    { to: '/media', label: 'Media Library', icon: Image },
  ];

  if (user?.role === 'super-admin' || (typeof user?.role === 'object' && user.role.slug === 'super-admin')) {
    links.push({ to: '/users', label: 'Users', icon: Users });
  }

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={clsx(
          "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <span className="text-xl font-bold text-white">Morphe CMS</span>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'} // Only exact match for dashboard
              className={({ isActive }) => clsx(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              onClick={() => {
                  if (window.innerWidth < 1024) onClose();
              }}
            >
              <link.icon className="w-5 h-5 mr-3" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                 {user?.fullName?.charAt(0).toUpperCase()}
               </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
