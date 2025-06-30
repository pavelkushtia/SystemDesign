import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  RectangleStackIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  CloudIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import UserProfile from '../auth/UserProfile';

// Emergency icon style to prevent giant icons - DO NOT REMOVE
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

interface MainLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'System Designer', href: '/designer', icon: CubeIcon },
  { name: 'Pattern Library', href: '/patterns', icon: RectangleStackIcon },
  { name: 'Service Builder', href: '/builders/services', icon: WrenchScrewdriverIcon },
  { name: 'ML Model Builder', href: '/builders/ml-models', icon: BeakerIcon },
  { name: 'Simulation', href: '/simulation', icon: BeakerIcon },
  { name: 'Deployment', href: '/deployment', icon: CloudIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Emergency CSS injection to prevent layout breaking on route changes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .main-layout-container { display: flex !important; height: 100vh !important; }
      svg { width: 1rem !important; height: 1rem !important; max-width: 1rem !important; max-height: 1rem !important; }
      .sidebar-nav svg { width: 1rem !important; height: 1rem !important; }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [location.pathname]);

  return (
    <div 
      className="main-layout-container flex h-screen bg-gray-50 dark:bg-gray-900"
      style={{ display: 'flex', height: '100vh' }}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" style={iconStyle} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div 
        className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0"
        style={{ position: 'fixed', width: '16rem', height: '100vh' }}
      >
        <div className="flex flex-1 flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div 
        className="flex flex-1 flex-col lg:ml-64"
        style={{ marginLeft: '16rem', flex: '1 1 0%' }}
      >
        {/* Desktop top bar with user profile */}
        <div className="hidden lg:flex sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <button
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                    title="Notifications"
                  >
                    <BellIcon style={iconStyle} />
                  </button>
                  <UserProfile />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" style={iconStyle} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              ScaleSim
            </h1>
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <>
                  <button
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                    title="Notifications"
                  >
                    <BellIcon style={iconStyle} />
                  </button>
                  <UserProfile />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );

  function SidebarContent() {
    return (
      <>
        {/* Logo and title */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div 
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg flex items-center justify-center"
                style={{ width: '2rem', height: '2rem' }}
              >
                <CubeIcon className="w-5 h-5 text-white" style={iconStyle} />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                ScaleSim
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAuthenticated && user ? `Welcome, ${user.firstName}` : 'Visual Studio for Distributed Systems'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                )
              }
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  location.pathname === item.href
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                )}
                style={iconStyle}
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            v1.0.0 - Visual Studio for Distributed Systems
          </p>
          {isAuthenticated && user && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Logged in as {user.email}
            </p>
          )}
        </div>
      </>
    );
  }
}

function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/designer': 'System Designer',
    '/patterns': 'Pattern Library',
    '/builders/services': 'Service Builder',
    '/builders/ml-models': 'ML Model Builder',
    '/simulation': 'Simulation',
    '/deployment': 'Deployment',
    '/settings': 'Settings',
    '/profile': 'Profile'
  };
  
  return routes[pathname] || 'ScaleSim';
} 