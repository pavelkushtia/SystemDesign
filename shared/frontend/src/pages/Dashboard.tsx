import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  RectangleStackIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  ChartBarIcon,
  ClockIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

// Emergency icon style to prevent giant icons - DO NOT REMOVE
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export default function Dashboard() {
  // Memoize static data to prevent recreation on every render
  const stats = useMemo(() => [
    { name: 'Total Systems', value: '12', icon: CubeIcon, change: '+2 this week' },
    { name: 'Patterns Used', value: '8', icon: RectangleStackIcon, change: '+1 this week' },
    { name: 'Simulations Run', value: '47', icon: ChartBarIcon, change: '+12 this week' },
    { name: 'Deployments', value: '5', icon: CloudIcon, change: '+1 this week' },
  ], []);

  const quickActions = useMemo(() => [
    {
      name: 'Design New System',
      description: 'Start with a blank canvas or choose a pattern',
      href: '/designer',
      icon: CubeIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Browse Patterns',
      description: 'Explore proven architecture patterns',
      href: '/patterns',
      icon: RectangleStackIcon,
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      name: 'Build Service',
      description: 'Generate microservice code',
      href: '/builders/services',
      icon: WrenchScrewdriverIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      name: 'Create ML Model',
      description: 'Visual ML model development',
      href: '/builders/ml-models',
      icon: BeakerIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ], []);

  const recentSystems = useMemo(() => [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Microservices-based online shopping system',
      lastModified: '2 hours ago',
      status: 'In Development',
      patterns: ['API Gateway', 'Event Sourcing', 'CQRS'],
    },
    {
      id: 2,
      name: 'ML Recommendation Engine',
      description: 'Real-time recommendation system with Kafka',
      lastModified: '1 day ago',
      status: 'Simulating',
      patterns: ['ML Pipeline', 'Stream Processing', 'Feature Store'],
    },
    {
      id: 3,
      name: 'IoT Data Pipeline',
      description: 'High-throughput IoT data processing',
      lastModified: '3 days ago',
      status: 'Deployed',
      patterns: ['Lambda Architecture', 'Load Balancer', 'Time Series DB'],
    },
  ], []);

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Design, simulate, and deploy distributed systems visually
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400 dark:text-gray-500" style={iconStyle} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center mb-3">
                  <div className={`inline-flex p-2 rounded-md ${action.color} text-white`}>
                    <action.icon className="h-5 w-5" style={iconStyle} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Systems */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Systems</h2>
            <Link
              to="/designer"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentSystems.map((system) => (
                <li key={system.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CubeIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" style={iconStyle} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {system.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {system.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" style={iconStyle} />
                          {system.lastModified}
                        </div>
                        <div className="flex items-center space-x-1">
                          {system.patterns.slice(0, 2).map((pattern) => (
                            <span
                              key={pattern}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            >
                              {pattern}
                            </span>
                          ))}
                          {system.patterns.length > 2 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              +{system.patterns.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          system.status === 'Deployed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : system.status === 'Simulating'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {system.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 