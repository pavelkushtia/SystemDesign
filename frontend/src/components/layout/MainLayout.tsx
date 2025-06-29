import React, { useState } from 'react';
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

// Emergency icon style to prevent giant icons
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

  // Force layout stability on route changes
  React.useEffect(() => {
    // Add emergency CSS to document head to override any conflicting styles
    const style = document.createElement('style');
    style.innerHTML = `
      /* EMERGENCY LAYOUT FIXES */
      .main-layout-container {
        display: flex !important;
        height: 100vh !important;
        width: 100% !important;
        overflow: hidden !important;
      }
      .sidebar-container {
        display: flex !important;
        width: 16rem !important;
        flex-direction: column !important;
        position: fixed !important;
        top: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
        z-index: 10 !important;
      }
      .main-content-container {
        display: flex !important;
        flex: 1 1 0% !important;
        flex-direction: column !important;
        margin-left: 16rem !important;
        min-height: 100vh !important;
      }
      /* Force ALL SVGs to be normal size */
      svg {
        width: 1rem !important;
        height: 1rem !important;
        max-width: 1rem !important;
        max-height: 1rem !important;
        min-width: 1rem !important;
        min-height: 1rem !important;
      }
      .icon-large svg {
        width: 2rem !important;
        height: 2rem !important;
        max-width: 2rem !important;
        max-height: 2rem !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [location.pathname]);

  return (
    <div 
      className="main-layout-container flex h-screen bg-gray-50 dark:bg-gray-900"
      style={{ 
        display: 'flex', 
        height: '100vh', 
        backgroundColor: '#f9fafb',
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(75, 85, 99, 0.75)' }} />
          <div 
            className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800"
            style={{ 
              position: 'relative', 
              display: 'flex', 
              width: '100%', 
              maxWidth: '20rem', 
              flex: '1 1 0%', 
              flexDirection: 'column', 
              backgroundColor: 'white' 
            }}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2" style={{ position: 'absolute', top: 0, right: '-3rem', paddingTop: '0.5rem' }}>
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
                style={{ 
                  marginLeft: '0.25rem', 
                  display: 'flex', 
                  height: '2.5rem', 
                  width: '2.5rem', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '50%' 
                }}
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
        style={{ 
          display: 'flex', 
          width: '16rem', 
          flexDirection: 'column', 
          position: 'fixed', 
          top: 0, 
          bottom: 0, 
          left: 0 
        }}
      >
        <div 
          className="flex flex-1 flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
          style={{ 
            display: 'flex', 
            flex: '1 1 0%', 
            flexDirection: 'column', 
            minHeight: 0, 
            backgroundColor: 'white', 
            borderRight: '1px solid #e5e7eb' 
          }}
        >
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div 
        className="flex flex-1 flex-col lg:ml-64"
        style={{ 
          display: 'flex', 
          flex: '1 1 0%', 
          flexDirection: 'column', 
          marginLeft: '16rem' 
        }}
      >
        {/* Top bar */}
        <div 
          className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3"
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10, 
            backgroundColor: 'white', 
            borderBottom: '1px solid #e5e7eb', 
            paddingLeft: '1rem', 
            paddingRight: '1rem', 
            paddingTop: '0.75rem', 
            paddingBottom: '0.75rem' 
          }}
        >
          <div 
            className="flex items-center justify-between"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <button
              type="button"
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
              onClick={() => setSidebarOpen(true)}
              style={{ 
                display: 'none', // Hidden on desktop
                height: '3rem', 
                width: '3rem', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '0.375rem' 
              }}
            >
              <Bars3Icon className="h-6 w-6" style={iconStyle} />
            </button>
            
            <div 
              className="flex items-center space-x-4"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <h1 
                className="text-lg font-semibold text-gray-900 dark:text-white"
                style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}
              >
                ScaleSim
              </h1>
            </div>
            
            <div 
              className="flex items-center space-x-4"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              {/* User menu would go here */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main 
          className="flex-1 overflow-y-auto"
          style={{ flex: '1 1 0%', overflowY: 'auto', padding: 0 }}
        >
          {children}
        </main>
      </div>
    </div>
  );

  function SidebarContent() {
    return (
      <div 
        className="flex flex-1 flex-col pt-5 pb-4 overflow-y-auto"
        style={{ 
          display: 'flex', 
          flex: '1 1 0%', 
          flexDirection: 'column', 
          paddingTop: '1.25rem', 
          paddingBottom: '1rem', 
          overflowY: 'auto' 
        }}
      >
        <div 
          className="flex items-center flex-shrink-0 px-4"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexShrink: 0, 
            paddingLeft: '1rem', 
            paddingRight: '1rem' 
          }}
        >
          <div 
            className="flex items-center space-x-3"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <div 
              className="w-6 h-6 bg-gradient-to-r from-brand-600 to-brand-400 rounded-lg flex items-center justify-center"
              style={{ 
                width: '1.5rem', 
                height: '1.5rem', 
                background: 'linear-gradient(to right, #0284c7, #38bdf8)', 
                borderRadius: '0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <CubeIcon 
                className="w-4 h-4 text-white" 
                style={iconStyle}
              />
            </div>
            <span 
              className="text-xl font-bold text-gray-900 dark:text-white"
              style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}
            >
              ScaleSim
            </span>
          </div>
        </div>
        
        <nav 
          className="mt-8 flex-1 px-2 space-y-1"
          style={{ 
            marginTop: '2rem', 
            flex: '1 1 0%', 
            paddingLeft: '0.5rem', 
            paddingRight: '0.5rem' 
          }}
        >
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-brand-100 dark:bg-brand-900 text-brand-900 dark:text-brand-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                )}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderRadius: '0.375rem',
                  marginBottom: '0.25rem',
                  textDecoration: 'none',
                  color: isActive ? '#0c4a6e' : '#4b5563',
                  backgroundColor: isActive ? '#e0f2fe' : 'transparent'
                }}
              >
                <item.icon
                  className={clsx(
                    'mr-3 h-4 w-4 flex-shrink-0',
                    isActive
                      ? 'text-brand-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                  style={{ ...iconStyle, marginRight: '0.75rem', flexShrink: 0 }}
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    );
  }
} 