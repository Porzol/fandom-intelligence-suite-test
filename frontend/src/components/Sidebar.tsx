import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  BrainIcon, 
  ChatBubbleLeftRightIcon, 
  BeakerIcon, 
  CpuChipIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  // Define navigation items with access control
  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: HomeIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPS_ANALYST, UserRole.TRAINER] 
    },
    { 
      name: 'AI Insights', 
      path: '/insights', 
      icon: BrainIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPS_ANALYST] 
    },
    { 
      name: 'AI Coach', 
      path: '/coach', 
      icon: ChatBubbleLeftRightIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER] 
    },
    { 
      name: 'A/B Testing', 
      path: '/testing', 
      icon: BeakerIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPS_ANALYST] 
    },
    { 
      name: 'Simulator', 
      path: '/simulator', 
      icon: CpuChipIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TRAINER] 
    },
    { 
      name: 'Creators', 
      path: '/creators', 
      icon: UserGroupIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      name: 'Team', 
      path: '/team', 
      icon: ClipboardDocumentListIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER] 
    },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: BellIcon, 
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.OPS_ANALYST, UserRole.TRAINER] 
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role as UserRole)
  );

  return (
    <div className="w-64 bg-dark-100 h-full flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-dark-300">
        <h1 className="text-2xl font-heading font-bold text-accent">Fandom Intel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  isActive ? "sidebar-link sidebar-link-active" : "sidebar-link sidebar-link-inactive"
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-dark-300">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-background font-bold">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
            <p className="text-xs text-light-300">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="mt-2 w-full text-sm text-left text-light-300 hover:text-accent"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
