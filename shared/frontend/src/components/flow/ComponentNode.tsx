import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  CubeIcon,
  CircleStackIcon,
  CloudIcon,
  ServerIcon,
  CpuChipIcon,
  QueueListIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface ComponentNodeData {
  componentType: string;
  name: string;
  config: Record<string, any>;
  status?: 'healthy' | 'warning' | 'error';
  metrics?: {
    cpu: number;
    memory: number;
    latency: number;
  };
}

const componentIcons: Record<string, React.ComponentType<any>> = {
  load_balancer: ShieldCheckIcon,
  microservice: CubeIcon,
  database: CircleStackIcon,
  cache: ServerIcon,
  message_queue: QueueListIcon,
  api_gateway: ShieldCheckIcon,
  ml_model: BeakerIcon,
  monitoring: ChartBarIcon,
  compute: CpuChipIcon,
  storage: CloudIcon,
};

const componentColors: Record<string, string> = {
  load_balancer: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  microservice: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  database: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
  cache: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
  message_queue: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  api_gateway: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  ml_model: 'border-pink-500 bg-pink-50 dark:bg-pink-900/20',
  monitoring: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20',
  compute: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  storage: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
};

const statusColors = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function ComponentNode({ data, selected }: NodeProps<ComponentNodeData>) {
  const IconComponent = componentIcons[data.componentType] || CubeIcon;
  const colorClass = componentColors[data.componentType] || 'border-gray-500 bg-gray-50';

  return (
    <div
      className={clsx(
        'min-w-[150px] border-2 rounded-lg shadow-md bg-white dark:bg-gray-800 transition-all duration-200',
        colorClass,
        selected ? 'ring-2 ring-brand-500 ring-offset-2 shadow-lg' : 'hover:shadow-lg'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="source"
        position={Position.Top}
        className="w-3 h-3 !bg-brand-500 !border-2 !border-white"
      />

      {/* Node Content */}
      <div className="p-3">
        {/* Header with icon and status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-white dark:bg-gray-700 shadow-sm">
              <IconComponent className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </div>
            {data.status && (
              <div
                className={clsx(
                  'w-2 h-2 rounded-full',
                  statusColors[data.status]
                )}
              />
            )}
          </div>
        </div>

        {/* Component Name */}
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          {data.name}
        </div>

        {/* Component Type */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 capitalize">
          {data.componentType.replace('_', ' ')}
        </div>

        {/* Key Configuration */}
        <div className="space-y-1">
          {Object.entries(data.config)
            .slice(0, 2)
            .map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 capitalize">
                  {key.replace('_', ' ')}:
                </span>
                <span className="text-gray-700 dark:text-gray-300 font-mono">
                  {String(value)}
                </span>
              </div>
            ))}
        </div>

        {/* Metrics (if available) */}
        {data.metrics && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">CPU</div>
                <div className="font-mono text-gray-700 dark:text-gray-300">
                  {data.metrics.cpu}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">MEM</div>
                <div className="font-mono text-gray-700 dark:text-gray-300">
                  {data.metrics.memory}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">LAT</div>
                <div className="font-mono text-gray-700 dark:text-gray-300">
                  {data.metrics.latency}ms
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="w-3 h-3 !bg-brand-500 !border-2 !border-white"
      />
    </div>
  );
} 