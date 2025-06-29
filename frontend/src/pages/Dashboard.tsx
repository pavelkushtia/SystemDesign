import React from 'react';
import { Link } from 'react-router-dom';
import {
  CubeIcon,
  RectangleStackIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  PlusIcon,
  ChartBarIcon,
  ClockIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export default function Dashboard() {
  const stats = [
    { name: 'Total Systems', value: '12', icon: CubeIcon, change: '+2 this week' },
    { name: 'Patterns Used', value: '8', icon: RectangleStackIcon, change: '+1 this week' },
    { name: 'Simulations Run', value: '47', icon: ChartBarIcon, change: '+12 this week' },
    { name: 'Deployments', value: '5', icon: CloudIcon, change: '+1 this week' },
  ];

  const quickActions = [
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
  ];

  const recentSystems = [
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
  ];

  // Hide loading screen when dashboard loads
  React.useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }, []);

  return (
    <div 
      className="min-h-full"
      style={{ minHeight: '100%', backgroundColor: '#f9fafb', padding: 0 }}
    >
      <div 
        className="bg-white shadow"
        style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
      >
        <div 
          className="px-4 py-6 sm:px-6 lg:px-8"
          style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
        >
          <div>
            <h1 
              className="text-2xl font-bold text-gray-900"
              style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}
            >
              Welcome back
            </h1>
            <p 
              className="text-gray-600"
              style={{ color: '#4b5563', fontSize: '1rem' }}
            >
              Design, simulate, and deploy distributed systems visually
            </p>
          </div>
        </div>
      </div>

      <div 
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        style={{ 
          maxWidth: '80rem', 
          margin: '0 auto', 
          paddingLeft: '2rem', 
          paddingRight: '2rem', 
          paddingTop: '2rem', 
          paddingBottom: '2rem' 
        }}
      >
        {/* Stats */}
        <div 
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '1.5rem', 
            marginBottom: '2rem' 
          }}
        >
          {stats.map((stat) => (
            <div 
              key={stat.name} 
              className="card"
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '0.75rem', 
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                border: '1px solid #e5e7eb',
                padding: '1.5rem'
              }}
            >
              <div 
                className="flex items-center"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <div 
                  className="flex-shrink-0"
                  style={{ flexShrink: 0 }}
                >
                  <stat.icon 
                    className="h-4 w-4 text-gray-400" 
                    style={iconStyle}
                  />
                </div>
                <div 
                  className="ml-5 w-0 flex-1"
                  style={{ marginLeft: '1.25rem', width: 0, flex: '1 1 0%' }}
                >
                  <dl>
                    <dt 
                      className="text-sm font-medium text-gray-500 truncate"
                      style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}
                    >
                      {stat.name}
                    </dt>
                    <dd 
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}
                    >
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
              <div 
                className="mt-2"
                style={{ marginTop: '0.5rem' }}
              >
                <div 
                  className="text-sm text-gray-600"
                  style={{ fontSize: '0.875rem', color: '#4b5563' }}
                >
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div 
          className="mb-8"
          style={{ marginBottom: '2rem' }}
        >
          <h2 
            className="text-lg font-medium text-gray-900 mb-4"
            style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '1rem' }}
          >
            Quick Actions
          </h2>
          <div 
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}
          >
            {quickActions.map((action) => (
              <Link 
                key={action.name} 
                to={action.href}
                className="group relative rounded-lg p-6 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                style={{ 
                  display: 'block',
                  position: 'relative',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  transition: 'box-shadow 0.15s ease-in-out'
                }}
              >
                <div>
                  <div 
                    className="flex items-center space-x-3"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                  >
                    <div 
                      className={`rounded-lg p-1.5 ${action.color} text-white`}
                      style={{ 
                        borderRadius: '0.5rem', 
                        padding: '0.375rem',
                        backgroundColor: action.color.includes('blue') ? '#3b82f6' : 
                                       action.color.includes('green') ? '#10b981' :
                                       action.color.includes('purple') ? '#8b5cf6' : '#f59e0b',
                        color: 'white'
                      }}
                    >
                      <action.icon 
                        className="h-4 w-4" 
                        style={iconStyle}
                      />
                    </div>
                    <div 
                      className="min-w-0 flex-1"
                      style={{ minWidth: 0, flex: '1 1 0%' }}
                    >
                      <p 
                        className="text-sm font-medium text-gray-900"
                        style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111827' }}
                      >
                        {action.name}
                      </p>
                      <p 
                        className="text-sm text-gray-500"
                        style={{ fontSize: '0.875rem', color: '#6b7280' }}
                      >
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Systems */}
        <div>
          <div 
            className="flex items-center justify-between mb-4"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}
          >
            <h2 
              className="text-lg font-medium text-gray-900"
              style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827' }}
            >
              Recent Systems
            </h2>
            <Link 
              to="/designer" 
              className="text-sm text-brand-600 hover:text-brand-500"
              style={{ fontSize: '0.875rem', color: '#0284c7', textDecoration: 'none' }}
            >
              View all
            </Link>
          </div>
          <div 
            className="grid gap-4"
            style={{ display: 'grid', gap: '1rem' }}
          >
            {recentSystems.map((system) => (
              <div 
                key={system.id}
                className="card p-6"
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '0.75rem', 
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem'
                }}
              >
                <div 
                  className="flex items-center justify-between"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div 
                    className="flex-1"
                    style={{ flex: '1 1 0%' }}
                  >
                    <h3 
                      className="text-lg font-medium text-gray-900"
                      style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827' }}
                    >
                      {system.name}
                    </h3>
                    <p 
                      className="text-sm text-gray-500 mt-1"
                      style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}
                    >
                      {system.description}
                    </p>
                    <div 
                      className="flex items-center mt-2 space-x-6"
                      style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '1.5rem' }}
                    >
                      <div 
                        className="flex items-center text-xs text-gray-500 dark:text-gray-400"
                        style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#6b7280' }}
                      >
                        <ClockIcon 
                          className="h-4 w-4 mr-1" 
                          style={iconStyle}
                        />
                        {system.lastModified}
                      </div>
                      <div 
                        className="flex items-center"
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            system.status === 'Deployed' ? 'bg-green-100 text-green-800' :
                            system.status === 'Simulating' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            paddingLeft: '0.625rem', 
                            paddingRight: '0.625rem', 
                            paddingTop: '0.125rem', 
                            paddingBottom: '0.125rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 500,
                            backgroundColor: system.status === 'Deployed' ? '#dcfce7' :
                                           system.status === 'Simulating' ? '#fef3c7' : '#dbeafe',
                            color: system.status === 'Deployed' ? '#166534' :
                                   system.status === 'Simulating' ? '#92400e' : '#1e40af'
                          }}
                        >
                          {system.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div 
                    className="ml-4"
                    style={{ marginLeft: '1rem' }}
                  >
                    <div 
                      className="flex flex-wrap gap-1"
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}
                    >
                      {system.patterns.map((pattern) => (
                        <span 
                          key={pattern}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            paddingLeft: '0.5rem', 
                            paddingRight: '0.5rem', 
                            paddingTop: '0.25rem', 
                            paddingBottom: '0.25rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.75rem', 
                            fontWeight: 500,
                            backgroundColor: '#f3f4f6',
                            color: '#1f2937'
                          }}
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 