import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const UserProfile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const iconStyle = { width: '1rem', height: '1rem', maxWidth: '1rem', maxHeight: '1rem' };
  const avatarStyle = { width: '2rem', height: '2rem', maxWidth: '2rem', maxHeight: '2rem' };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    // Use window.location for immediate redirect to bypass auth checks
    window.location.href = '/auth';
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          color: '#374151',
          fontSize: '0.875rem',
          transition: 'all 0.15s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f3f4f6';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="User avatar"
              style={{
                ...avatarStyle,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <UserCircleIcon style={avatarStyle} />
          )}
          <span style={{ fontWeight: '500' }}>
            {user.firstName} {user.lastName}
          </span>
        </div>
        <ChevronDownIcon 
          style={{
            ...iconStyle,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease-in-out'
          }} 
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          minWidth: '200px',
          zIndex: 50
        }}>
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#1f2937',
              margin: 0
            }}>
              {user.firstName} {user.lastName}
            </p>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0,
              marginTop: '0.25rem'
            }}>
              {user.email}
            </p>
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            <button
              onClick={handleProfileClick}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#374151',
                textAlign: 'left',
                transition: 'background-color 0.15s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <UserCircleIcon style={iconStyle} />
              View Profile
            </button>

            <button
              onClick={handleSettingsClick}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#374151',
                textAlign: 'left',
                transition: 'background-color 0.15s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Cog6ToothIcon style={iconStyle} />
              Settings
            </button>

            <div style={{
              height: '1px',
              backgroundColor: '#e5e7eb',
              margin: '0.5rem 0'
            }}></div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#dc2626',
                textAlign: 'left',
                transition: 'background-color 0.15s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowRightOnRectangleIcon style={iconStyle} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 