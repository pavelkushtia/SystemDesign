import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export default function Settings() {
  return (
    <div 
      className="min-h-full bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8"
      style={{ 
        minHeight: '100%', 
        backgroundColor: '#f9fafb', 
        paddingTop: '2rem', 
        paddingBottom: '2rem', 
        paddingLeft: '2rem', 
        paddingRight: '2rem' 
      }}
    >
      <div 
        className="mb-8"
        style={{ marginBottom: '2rem' }}
      >
        <h1 
          className="text-3xl font-bold text-gray-900 dark:text-white flex items-center"
          style={{ 
            fontSize: '1.875rem', 
            fontWeight: 700, 
            color: '#111827', 
            display: 'flex', 
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}
        >
          <Cog6ToothIcon 
            className="h-8 w-8 mr-3 text-brand-500" 
            style={{ ...iconStyle, width: '2rem', height: '2rem', maxWidth: '2rem', maxHeight: '2rem', marginRight: '0.75rem' }}
          />
          Settings
        </h1>
        <p 
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}
        >
          Configure your ScaleSim workspace
        </p>
      </div>

      <div 
        className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
        style={{ 
          backgroundColor: 'white', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          borderRadius: '0.5rem', 
          padding: '1.5rem' 
        }}
      >
        <p 
          className="text-gray-600 dark:text-gray-400"
          style={{ color: '#4b5563', fontSize: '1rem' }}
        >
          Settings configuration panel coming soon...
        </p>
      </div>
    </div>
  );
} 