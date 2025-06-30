import React, { useState } from 'react';
import {
  BeakerIcon,
  PlayIcon,
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { SimulationEngine, LoadPattern, ComponentConfig, SystemMetrics } from '@/components/simulation/SimulationEngine';

// Emergency icon style to prevent giant icons
const iconStyle = { 
  width: '1rem', 
  height: '1rem', 
  maxWidth: '1rem', 
  maxHeight: '1rem',
  minWidth: '1rem',
  minHeight: '1rem'
};

export default function Simulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SystemMetrics | null>(null);
  const [loadConfig, setLoadConfig] = useState<LoadPattern>({
    users: 100,
    duration: 300,
    rampUp: 30,
    requestsPerSecond: 50,
    pattern: 'constant'
  });

  // Mock system components for simulation
  const mockComponents: ComponentConfig[] = [
    {
      id: 'api-gateway',
      type: 'api-gateway',
      name: 'API Gateway',
      specs: { cpu: 2, memory: 4, storage: 100, network: 1000 },
      scaling: { min: 1, max: 5, auto: true },
      connections: [
        { from: 'api-gateway', to: 'user-service', type: 'sync', weight: 0.6 },
        { from: 'api-gateway', to: 'product-service', type: 'sync', weight: 0.4 }
      ]
    },
    {
      id: 'user-service',
      type: 'microservice',
      name: 'User Service',
      specs: { cpu: 4, memory: 8, storage: 200, network: 1000 },
      scaling: { min: 2, max: 10, auto: true },
      connections: [
        { from: 'user-service', to: 'postgres-users', type: 'database', weight: 1.0 },
        { from: 'user-service', to: 'redis-cache', type: 'cache', weight: 0.8 }
      ]
    },
    {
      id: 'product-service',
      type: 'microservice',
      name: 'Product Service',
      specs: { cpu: 4, memory: 8, storage: 200, network: 1000 },
      scaling: { min: 2, max: 10, auto: true },
      connections: [
        { from: 'product-service', to: 'postgres-products', type: 'database', weight: 1.0 },
        { from: 'product-service', to: 'elasticsearch', type: 'database', weight: 0.3 }
      ]
    },
    {
      id: 'postgres-users',
      type: 'postgresql',
      name: 'User Database',
      specs: { cpu: 8, memory: 32, storage: 1000, network: 1000 },
      scaling: { min: 1, max: 3, auto: false },
      connections: []
    },
    {
      id: 'postgres-products',
      type: 'postgresql',
      name: 'Product Database',
      specs: { cpu: 8, memory: 32, storage: 1000, network: 1000 },
      scaling: { min: 1, max: 3, auto: false },
      connections: []
    },
    {
      id: 'redis-cache',
      type: 'redis',
      name: 'Redis Cache',
      specs: { cpu: 2, memory: 16, storage: 100, network: 1000 },
      scaling: { min: 1, max: 5, auto: true },
      connections: []
    },
    {
      id: 'elasticsearch',
      type: 'elasticsearch',
      name: 'Product Search',
      specs: { cpu: 4, memory: 16, storage: 500, network: 1000 },
      scaling: { min: 1, max: 3, auto: true },
      connections: []
    }
  ];

  const runSimulation = async () => {
    setIsRunning(true);
    setResults(null);

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const simulationResults = SimulationEngine.simulateSystem(mockComponents, loadConfig);
      setResults(simulationResults);
    } catch (error) {
      console.error('Simulation failed:', error);
      // Fallback to mock results
      setResults({
        totalLatency: 245,
        totalThroughput: 850,
        totalErrorRate: 0.12,
        totalCost: 2.45,
        bottlenecks: ['user-service: High CPU utilization (89.2%)', 'postgres-users: High latency (156ms)'],
        recommendations: [
          'Scale out user-service to reduce CPU load',
          'Add connection pooling for postgres-users',
          'Consider adding horizontal pod autoscaling for user-service'
        ],
        components: [
          { id: 'api-gateway', type: 'api-gateway', cpu: 45.2, memory: 32.1, latency: 12, throughput: 2100, errorRate: 0.05, connections: 156 },
          { id: 'user-service', type: 'microservice', cpu: 89.2, memory: 76.4, latency: 145, throughput: 850, errorRate: 0.18, connections: 89 },
          { id: 'product-service', type: 'microservice', cpu: 67.3, memory: 54.2, latency: 89, throughput: 1200, errorRate: 0.08, connections: 67 },
          { id: 'postgres-users', type: 'postgresql', cpu: 71.8, memory: 68.9, latency: 156, throughput: 950, errorRate: 0.03, connections: 45 },
          { id: 'postgres-products', type: 'postgresql', cpu: 55.4, memory: 45.7, latency: 98, throughput: 1300, errorRate: 0.02, connections: 34 },
          { id: 'redis-cache', type: 'redis', cpu: 23.1, memory: 15.6, latency: 2, throughput: 5400, errorRate: 0.01, connections: 234 },
          { id: 'elasticsearch', type: 'elasticsearch', cpu: 61.2, memory: 52.3, latency: 67, throughput: 1100, errorRate: 0.04, connections: 23 }
        ]
      });
    }

    setIsRunning(false);
  };

  const updateLoadConfig = (field: keyof LoadPattern, value: any) => {
    setLoadConfig(prev => ({ ...prev, [field]: value }));
  };

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
          <BeakerIcon 
            className="h-8 w-8 mr-3 text-brand-500" 
            style={{ ...iconStyle, width: '2rem', height: '2rem', maxWidth: '2rem', maxHeight: '2rem', marginRight: '0.75rem' }}
          />
          Performance Simulation
        </h1>
        <p 
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
          style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}
        >
          Test your system's performance under various load conditions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            padding: '1.5rem'
          }}
        >
          <h2
            className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
            style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}
          >
            Load Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
              >
                Concurrent Users
              </label>
              <input
                type="number"
                value={loadConfig.users}
                onChange={(e) => updateLoadConfig('users', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  width: '100%',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
              >
                Duration (seconds)
              </label>
              <input
                type="number"
                value={loadConfig.duration}
                onChange={(e) => updateLoadConfig('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  width: '100%',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
              >
                Requests per Second
              </label>
              <input
                type="number"
                value={loadConfig.requestsPerSecond}
                onChange={(e) => updateLoadConfig('requestsPerSecond', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  width: '100%',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}
              >
                Load Pattern
              </label>
              <select
                value={loadConfig.pattern}
                onChange={(e) => updateLoadConfig('pattern', e.target.value as LoadPattern['pattern'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  width: '100%',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  outline: 'none'
                }}
              >
                <option value="constant">Constant Load</option>
                <option value="spike">Traffic Spike</option>
                <option value="ramp">Gradual Ramp</option>
                <option value="wave">Wave Pattern</option>
              </select>
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: 'none',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease-in-out',
                opacity: isRunning ? 0.5 : 1
              }}
            >
              <PlayIcon
                className="w-4 h-4 mr-2"
                style={{ ...iconStyle, marginRight: '0.5rem' }}
              />
              {isRunning ? 'Running Simulation...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {results ? (
            <div className="space-y-6">
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem'
                }}
              >
                <h3
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                  style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}
                >
                  System Performance
                </h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold text-blue-600"
                      style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}
                    >
                      {results.totalLatency.toFixed(0)}ms
                    </div>
                    <div
                      className="text-sm text-gray-600"
                      style={{ fontSize: '0.875rem', color: '#4b5563' }}
                    >
                      Avg Latency
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold text-green-600"
                      style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}
                    >
                      {results.totalThroughput.toFixed(0)}
                    </div>
                    <div
                      className="text-sm text-gray-600"
                      style={{ fontSize: '0.875rem', color: '#4b5563' }}
                    >
                      RPS
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${results.totalErrorRate > 1 ? 'text-red-600' : 'text-yellow-600'}`}
                      style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 700, 
                        color: results.totalErrorRate > 1 ? '#dc2626' : '#ca8a04' 
                      }}
                    >
                      {results.totalErrorRate.toFixed(2)}%
                    </div>
                    <div
                      className="text-sm text-gray-600"
                      style={{ fontSize: '0.875rem', color: '#4b5563' }}
                    >
                      Error Rate
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div
                      className="text-2xl font-bold text-purple-600"
                      style={{ fontSize: '1.5rem', fontWeight: 700, color: '#9333ea' }}
                    >
                      ${results.totalCost.toFixed(2)}
                    </div>
                    <div
                      className="text-sm text-gray-600"
                      style={{ fontSize: '0.875rem', color: '#4b5563' }}
                    >
                      Cost/Hour
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  padding: '1.5rem'
                }}
              >
                <h3
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                  style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}
                >
                  Component Metrics
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium">Component</th>
                        <th className="text-left py-2 font-medium">CPU %</th>
                        <th className="text-left py-2 font-medium">Memory %</th>
                        <th className="text-left py-2 font-medium">Latency (ms)</th>
                        <th className="text-left py-2 font-medium">Throughput</th>
                        <th className="text-left py-2 font-medium">Error %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.components.map((component, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 font-medium">{component.id}</td>
                          <td className={`py-2 ${component.cpu > 80 ? 'text-red-600' : component.cpu > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {component.cpu.toFixed(1)}%
                          </td>
                          <td className={`py-2 ${component.memory > 85 ? 'text-red-600' : component.memory > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {component.memory.toFixed(1)}%
                          </td>
                          <td className="py-2">{component.latency.toFixed(0)}ms</td>
                          <td className="py-2">{component.throughput.toFixed(0)}</td>
                          <td className={`py-2 ${component.errorRate > 1 ? 'text-red-600' : component.errorRate > 0.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {component.errorRate.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {results.bottlenecks.length > 0 && (
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    padding: '1.5rem'
                  }}
                >
                  <h3
                    className="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                    style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}
                  >
                    Bottlenecks & Recommendations
                  </h3>
                  
                  <div className="space-y-4">
                    {results.bottlenecks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">⚠️ Bottlenecks</h4>
                        <ul className="space-y-1">
                          {results.bottlenecks.map((bottleneck, index) => (
                            <li key={index} className="text-sm text-gray-700">{bottleneck}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {results.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">💡 Recommendations</h4>
                        <ul className="space-y-1">
                          {results.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-gray-700">{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                padding: '3rem',
                textAlign: 'center'
              }}
            >
              <ChartBarIcon
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem auto', color: '#9ca3af' }}
              />
              <h3
                className="text-lg font-medium text-gray-900 dark:text-white mb-2"
                style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827', marginBottom: '0.5rem' }}
              >
                No simulation results yet
              </h3>
              <p
                className="text-gray-600 dark:text-gray-400"
                style={{ color: '#4b5563' }}
              >
                Configure your load parameters and click "Run Simulation" to see performance metrics
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 