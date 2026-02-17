import React, { useState } from 'react';
import { Menu, LogOut, Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import api from '../services/api';
import { FileText, Briefcase, Settings as ServiceIcon } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/dashboard/search?q=${query}`);
      setSearchResults(response.data.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-400 hover:text-white rounded-lg lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Search */}
        {user?.role !== 'viewer' && (
          <div className="relative hidden md:block ml-4">
            <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 w-64 border border-gray-700 focus-within:border-indigo-500 transition-colors">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-full"
            />
            {isSearching && <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
          </div>

          {/* Search Results Dropdown */}
          {searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden backdrop-blur-sm bg-opacity-95">
              <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Results</span>
                <span className="text-[10px] text-gray-500">{searchResults.length} found</span>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => {
                        navigate(result.link);
                        clearSearch();
                      }}
                      className="w-full flex items-center px-4 py-3 hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className={clsx(
                        "p-2 rounded-lg mr-3 transition-colors",
                        result.type === 'post' ? "bg-blue-500/10 text-blue-400" :
                        result.type === 'job' ? "bg-cyan-500/10 text-cyan-400" :
                        "bg-indigo-500/10 text-indigo-400"
                      )}>
                        {result.type === 'post' ? <FileText className="w-4 h-4" /> :
                         result.type === 'job' ? <Briefcase className="w-4 h-4" /> :
                         <ServiceIcon className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400">
                          {result.title}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                          {result.type}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.fullName?.substring(0, 2).toUpperCase()}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-20">
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
