import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface PropertyPanelProps {
  node: Node;
  onNodeUpdate: (node: Node) => void;
  onClose: () => void;
}

export function PropertyPanel({ node, onNodeUpdate, onClose }: PropertyPanelProps) {
  const [name, setName] = useState(node.data.name || '');
  const [config, setConfig] = useState(node.data.config || {});

  useEffect(() => {
    setName(node.data.name || '');
    setConfig(node.data.config || {});
  }, [node]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    onNodeUpdate({
      ...node,
      data: {
        ...node.data,
        name: newName,
      },
    });
  };

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onNodeUpdate({
      ...node,
      data: {
        ...node.data,
        config: newConfig,
      },
    });
  };

  const addConfigProperty = () => {
    const key = `property_${Object.keys(config).length + 1}`;
    handleConfigChange(key, '');
  };

  const removeConfigProperty = (key: string) => {
    const newConfig = { ...config };
    delete newConfig[key];
    setConfig(newConfig);
    onNodeUpdate({
      ...node,
      data: {
        ...node.data,
        config: newConfig,
      },
    });
  };

  const getConfigFieldType = (key: string, value: any) => {
    if (typeof value === 'boolean') return 'checkbox';
    if (typeof value === 'number') return 'number';
    if (key.toLowerCase().includes('port')) return 'number';
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) return 'password';
    return 'text';
  };

  const formatKey = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Properties
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Basic Information
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <input
                type="text"
                value={node.data.componentType}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Configuration
            </h4>
            <button
              onClick={addConfigProperty}
              className="text-xs px-2 py-1 bg-brand-500 text-white rounded hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Add Property
            </button>
          </div>
          <div className="space-y-3">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formatKey(key)}
                  </label>
                  {getConfigFieldType(key, value) === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => handleConfigChange(key, e.target.checked)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                  ) : (
                    <input
                      type={getConfigFieldType(key, value)}
                      value={String(value)}
                      onChange={(e) => {
                        const newValue = getConfigFieldType(key, value) === 'number' 
                          ? Number(e.target.value) || 0
                          : e.target.value;
                        handleConfigChange(key, newValue);
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
                <button
                  onClick={() => removeConfigProperty(key)}
                  className="p-1 text-red-400 hover:text-red-500 focus:outline-none"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Position */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Position
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                X
              </label>
              <input
                type="number"
                value={Math.round(node.position.x)}
                onChange={(e) => {
                  const newPosition = { ...node.position, x: Number(e.target.value) };
                  onNodeUpdate({ ...node, position: newPosition });
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Y
              </label>
              <input
                type="number"
                value={Math.round(node.position.y)}
                onChange={(e) => {
                  const newPosition = { ...node.position, y: Number(e.target.value) };
                  onNodeUpdate({ ...node, position: newPosition });
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Node ID (read-only) */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Node ID
          </h4>
          <input
            type="text"
            value={node.id}
            disabled
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed font-mono"
          />
        </div>
      </div>
    </div>
  );
} 