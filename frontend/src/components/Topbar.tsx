import React from 'react';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface TopbarProps {
  toggleNotifications: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ toggleNotifications }) => {
  return (
    <header className="bg-dark-100 border-b border-dark-300 py-3 px-4 md:px-6">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-light-300" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search..."
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Filter Button */}
          <button className="btn btn-secondary">
            Filter
          </button>

          {/* Notification Button */}
          <button
            onClick={toggleNotifications}
            className="relative p-2 rounded-full hover:bg-dark-200"
          >
            <BellIcon className="h-6 w-6 text-light-300" />
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-status-risk"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
