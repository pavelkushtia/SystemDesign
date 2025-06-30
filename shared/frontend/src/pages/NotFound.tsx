import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export default function NotFound() {
  return (
    <div 
      className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        minHeight: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: '3rem', 
        paddingBottom: '3rem', 
        paddingLeft: '2rem', 
        paddingRight: '2rem',
        backgroundColor: '#f9fafb'
      }}
    >
      <div 
        className="max-w-md w-full text-center"
        style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}
      >
        <ExclamationTriangleIcon 
          className="mx-auto h-12 w-12 text-gray-400" 
          style={{ 
            ...iconStyle, 
            width: '3rem', 
            height: '3rem', 
            maxWidth: '3rem', 
            maxHeight: '3rem',
            margin: '0 auto',
            color: '#9ca3af'
          }}
        />
        <h2 
          className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white"
          style={{ 
            marginTop: '1.5rem', 
            fontSize: '1.875rem', 
            fontWeight: 800, 
            color: '#111827' 
          }}
        >
          Page not found
        </h2>
        <p 
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#4b5563' 
          }}
        >
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div 
          className="mt-6"
          style={{ marginTop: '1.5rem' }}
        >
          <Link
            to="/dashboard"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            style={{ 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              paddingTop: '0.5rem', 
              paddingBottom: '0.5rem', 
              paddingLeft: '1rem', 
              paddingRight: '1rem', 
              border: 'none', 
              borderRadius: '0.375rem', 
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              color: 'white', 
              backgroundColor: '#0284c7',
              textDecoration: 'none'
            }}
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
} 