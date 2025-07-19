import React, { useState, useEffect, useRef } from 'react';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  ServerIcon,
  SignalIcon,
  BellIcon,
  EyeIcon,
  XMarkIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';

interface MetricData {
  timestamp: number;
  value: number;
  unit: string;
}

interface ComponentHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    cpu: number;
    memory: number;
    responseTime: number;
    errorRate: number;
  };
  lastUpdated: Date;
}

interface Alert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  triggeredAt: Date;
  componentId?: string;
}

const MonitoringDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState('demo-system-1');
  const [components, setComponents] = useState<ComponentHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<Record<string, MetricData[]>>({});
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const timeRanges = [
    { value: '5m', label: '5 minutes' },
    { value: '15m', label: '15 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' }
  ];

  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    if (isRealTimeEnabled) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isRealTimeEnabled]);

  useEffect(() => {
    // Fetch initial data
    fetchDashboardData();
  }, [selectedSystem, selectedTimeRange]);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://api.scalesim.app' 
      : 'ws://localhost:3001';
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to monitoring WebSocket');
      // Subscribe to system metrics
      wsRef.current?.send(JSON.stringify({
        type: 'subscribe',
        systemId: selectedSystem
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Monitoring WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      if (isRealTimeEnabled) {
        setTimeout(connectWebSocket, 5000);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'metric':
        updateMetric(data.data);
        break;
      case 'alert':
        updateAlert(data.data);
        break;
      case 'initial_data':
        setComponents(data.systems[0]?.health?.components || []);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  const updateMetric = (metric: any) => {
    setMetrics(prev => {
      const key = `${metric.componentId}_${metric.metricType}`;
      const existing = prev[key] || [];
      const updated = [...existing, {
        timestamp: metric.timestamp,
        value: metric.value,
        unit: metric.unit
      }].slice(-100); // Keep last 100 data points

      return { ...prev, [key]: updated };
    });

    // Update component health
    setComponents(prev => prev.map(comp => {
      if (comp.id === metric.componentId) {
        return {
          ...comp,
          metrics: {
            ...comp.metrics,
            [metric.metricType]: metric.value
          },
          lastUpdated: new Date()
        };
      }
      return comp;
    }));
  };

  const updateAlert = (alert: Alert) => {
    setAlerts(prev => {
      const existing = prev.find(a => a.id === alert.id);
      if (existing) {
        return prev.map(a => a.id === alert.id ? alert : a);
      } else {
        return [alert, ...prev].slice(0, 50); // Keep last 50 alerts
      }
    });
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/monitoring/dashboard/${selectedSystem}?timeRange=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComponents(data.data.health.components || []);
        setAlerts(data.data.alerts || []);
        setMetrics(data.data.metrics || {});
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, status: 'acknowledged' }
            : alert
        ));
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'percent') {
      return `${value.toFixed(1)}%`;
    } else if (unit === 'milliseconds') {
      return `${value.toFixed(0)}ms`;
    } else if (unit === 'bytes') {
      if (value > 1024 * 1024 * 1024) {
        return `${(value / (1024 * 1024 * 1024)).toFixed(1)}GB`;
      } else if (value > 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(1)}MB`;
      } else if (value > 1024) {
        return `${(value / 1024).toFixed(1)}KB`;
      }
      return `${value}B`;
    }
    return `${value.toFixed(2)} ${unit}`;
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                System Monitoring
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>

              {/* Real-time Toggle */}
              <button
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isRealTimeEnabled
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {isRealTimeEnabled ? (
                  <PlayIcon className="h-4 w-4" />
                ) : (
                  <PauseIcon className="h-4 w-4" />
                )}
                <span>{isRealTimeEnabled ? 'Live' : 'Paused'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Summary */}
        {activeAlerts.length > 0 && (
          <div className="mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h3 className="ml-2 text-lg font-medium text-red-800 dark:text-red-200">
                  Active Alerts ({activeAlerts.length})
                </h3>
                {criticalAlerts.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-full">
                    {criticalAlerts.length} Critical
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {activeAlerts.slice(0, 3).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">{alert.message}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {alert.triggeredAt.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
                {activeAlerts.length > 3 && (
                  <div className="text-center">
                    <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                      View all {activeAlerts.length} alerts
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ServerIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Components</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{components.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Healthy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {components.filter(c => c.status === 'healthy').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {components.filter(c => c.status === 'warning').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeAlerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Component Health Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {components.map(component => (
            <div
              key={component.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedComponent(component.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{component.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(component.status)}`}>
                  {component.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CpuChipIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">CPU</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(component.metrics.cpu, 'percent')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <ServerIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Memory</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(component.metrics.memory, 'percent')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Response</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(component.metrics.responseTime, 'milliseconds')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <SignalIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Errors</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(component.metrics.errorRate, 'percent')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                Last updated: {component.lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* No Data State */}
        {components.length === 0 && (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No monitoring data</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start monitoring your system components to see real-time metrics and alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringDashboard;