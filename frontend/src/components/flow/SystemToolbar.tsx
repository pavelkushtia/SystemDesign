import React, { useState } from 'react';
import {
  DocumentArrowUpIcon,
  PlayIcon,
  CloudIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  Cog6ToothIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CubeIcon,
  DocumentArrowDownIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SystemToolbarProps {
  systemName: string;
  onSystemNameChange: (name: string) => void;
  onSave: () => void;
  onSimulate: () => void;
  onDeploy: () => void;
  isSimulating: boolean;
}

export function SystemToolbar({
  systemName,
  onSystemNameChange,
  onSave,
  onSimulate,
  onDeploy,
  isSimulating,
}: SystemToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const iconStyle = {
    width: '1rem',
    height: '1rem',
    maxWidth: '1rem',
    maxHeight: '1rem'
  };

  return (
    <div 
      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0.75rem 1rem', 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb' 
      }}
    >
      {/* System Name */}
      <div 
        className="flex items-center space-x-3"
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
      >
        <CubeIcon 
          className="h-6 w-6 text-brand-500" 
          style={{ ...iconStyle, width: '1.5rem', height: '1.5rem', maxWidth: '1.5rem', maxHeight: '1.5rem', color: '#0284c7' }}
        />
        {isEditing ? (
          <input
            type="text"
            value={systemName}
            onChange={(e) => onSystemNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-brand-500"
            style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              backgroundColor: 'transparent', 
              borderBottom: '1px solid #d1d5db', 
              outline: 'none',
              minWidth: '200px'
            }}
            autoFocus
          />
        ) : (
          <h1
            className="text-lg font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-brand-600"
            onClick={() => setIsEditing(true)}
            style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: '#111827', 
              cursor: 'pointer' 
            }}
          >
            {systemName}
          </h1>
        )}
      </div>

      {/* Action Buttons */}
      <div 
        className="flex items-center space-x-2"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <button
          onClick={onSave}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            paddingLeft: '0.75rem', 
            paddingRight: '0.75rem', 
            paddingTop: '0.375rem', 
            paddingBottom: '0.375rem', 
            border: '1px solid #d1d5db', 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            borderRadius: '0.375rem', 
            color: '#374151', 
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <DocumentArrowDownIcon 
            className="h-4 w-4 mr-1.5" 
            style={{...iconStyle, marginRight: '0.375rem'}}
          />
          Save
        </button>

        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            paddingLeft: '0.75rem', 
            paddingRight: '0.75rem', 
            paddingTop: '0.375rem', 
            paddingBottom: '0.375rem', 
            border: 'none', 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            borderRadius: '0.375rem', 
            color: 'white', 
            backgroundColor: '#2563eb',
            cursor: 'pointer',
            opacity: isSimulating ? 0.5 : 1
          }}
        >
          {isSimulating ? (
            <div 
              className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1.5"
              style={{ 
                width: '1rem', 
                height: '1rem', 
                borderRadius: '50%', 
                borderBottomWidth: '2px', 
                borderBottomColor: 'white',
                marginRight: '0.375rem',
                animation: 'spin 1s linear infinite'
              }}
            />
          ) : (
            <PlayIcon 
              className="h-4 w-4 mr-1.5" 
              style={{...iconStyle, marginRight: '0.375rem'}}
            />
          )}
          {isSimulating ? 'Simulating...' : 'Simulate'}
        </button>

        <button
          onClick={onDeploy}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            paddingLeft: '0.75rem', 
            paddingRight: '0.75rem', 
            paddingTop: '0.375rem', 
            paddingBottom: '0.375rem', 
            border: 'none', 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            borderRadius: '0.375rem', 
            color: 'white', 
            backgroundColor: '#16a34a',
            cursor: 'pointer'
          }}
        >
          <RocketLaunchIcon 
            className="h-4 w-4 mr-1.5" 
            style={{...iconStyle, marginRight: '0.375rem'}}
          />
          Deploy
        </button>
      </div>
    </div>
  );
} 