import { Router, Request, Response, NextFunction } from 'express';
import { 
  ValidationError,
  ApiResponse,
  NotFoundError
} from '@scalesim/shared';
import { authenticateToken } from '../middleware/auth';
import { MonitoringService, MetricData, AlertRule } from '../services/monitoring';
import { logger } from '../utils/logger';

const router = Router();

// Initialize monitoring service (will be injected from main app)
let monitoringService: MonitoringService;

export function setMonitoringService(service: MonitoringService) {
  monitoringService = service;
}

// ============================================================================
// METRICS ENDPOINTS
// ============================================================================

// POST /api/monitoring/metrics - Record a metric
router.post('/metrics', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId, componentId, metricType, value, unit, tags } = req.body;

    if (!systemId || !componentId || !metricType || value === undefined || !unit) {
      return next(new ValidationError('systemId, componentId, metricType, value, and unit are required', []));
    }

    const metric: MetricData = {
      timestamp: Date.now(),
      systemId,
      componentId,
      metricType,
      value: parseFloat(value),
      unit,
      tags: tags || {}
    };

    monitoringService.recordMetric(metric);

    const response: ApiResponse = {
      success: true,
      data: { message: 'Metric recorded successfully' },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error recording metric:', error);
    next(error);
  }
});

// GET /api/monitoring/metrics/:systemId - Get metrics for a system
router.get('/metrics/:systemId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId } = req.params;
    const { startTime, endTime, metricTypes } = req.query;

    if (!startTime || !endTime) {
      return next(new ValidationError('startTime and endTime query parameters are required', []));
    }

    const start = new Date(startTime as string);
    const end = new Date(endTime as string);
    const types = metricTypes ? (metricTypes as string).split(',') : undefined;

    const metrics = monitoringService.getMetrics(systemId, start, end, types);

    const response: ApiResponse = {
      success: true,
      data: {
        metrics,
        count: metrics.length,
        timeRange: { startTime: start, endTime: end }
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    next(error);
  }
});

// GET /api/monitoring/health/:systemId - Get system health summary
router.get('/health/:systemId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId } = req.params;
    const health = monitoringService.getSystemHealth(systemId);

    const response: ApiResponse = {
      success: true,
      data: health,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching system health:', error);
    next(error);
  }
});

// ============================================================================
// ALERT RULES ENDPOINTS
// ============================================================================

// POST /api/monitoring/alert-rules - Create an alert rule
router.post('/alert-rules', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      systemId, 
      componentId, 
      metricType, 
      condition, 
      threshold, 
      duration, 
      severity, 
      notificationChannels 
    } = req.body;

    if (!systemId || !metricType || !condition || threshold === undefined || !severity) {
      return next(new ValidationError('systemId, metricType, condition, threshold, and severity are required', []));
    }

    const validConditions = ['greater_than', 'less_than', 'equals', 'not_equals'];
    if (!validConditions.includes(condition)) {
      return next(new ValidationError(`condition must be one of: ${validConditions.join(', ')}`, []));
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return next(new ValidationError(`severity must be one of: ${validSeverities.join(', ')}`, []));
    }

    const alertRule = monitoringService.createAlertRule({
      systemId,
      componentId,
      metricType,
      condition,
      threshold: parseFloat(threshold),
      duration: duration || 60,
      severity,
      enabled: true,
      notificationChannels: notificationChannels || []
    });

    const response: ApiResponse = {
      success: true,
      data: alertRule,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error creating alert rule:', error);
    next(error);
  }
});

// GET /api/monitoring/alert-rules/:systemId - Get alert rules for a system
router.get('/alert-rules/:systemId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId } = req.params;
    const alertRules = monitoringService.getAlertRules(systemId);

    const response: ApiResponse = {
      success: true,
      data: {
        alertRules,
        count: alertRules.length
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching alert rules:', error);
    next(error);
  }
});

// PUT /api/monitoring/alert-rules/:ruleId - Update an alert rule
router.put('/alert-rules/:ruleId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;

    const updatedRule = monitoringService.updateAlertRule(ruleId, updates);
    if (!updatedRule) {
      throw new NotFoundError('Alert rule');
    }

    const response: ApiResponse = {
      success: true,
      data: updatedRule,
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error updating alert rule:', error);
    next(error);
  }
});

// DELETE /api/monitoring/alert-rules/:ruleId - Delete an alert rule
router.delete('/alert-rules/:ruleId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ruleId } = req.params;
    const deleted = monitoringService.deleteAlertRule(ruleId);

    if (!deleted) {
      throw new NotFoundError('Alert rule');
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Alert rule deleted successfully' },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error deleting alert rule:', error);
    next(error);
  }
});

// ============================================================================
// ALERTS ENDPOINTS
// ============================================================================

// GET /api/monitoring/alerts/:systemId - Get active alerts for a system
router.get('/alerts/:systemId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId } = req.params;
    const alerts = monitoringService.getActiveAlerts(systemId);

    const response: ApiResponse = {
      success: true,
      data: {
        alerts,
        count: alerts.length
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching alerts:', error);
    next(error);
  }
});

// POST /api/monitoring/alerts/:alertId/acknowledge - Acknowledge an alert
router.post('/alerts/:alertId/acknowledge', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { alertId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return next(new ValidationError('User ID is required', []));
    }

    const acknowledged = monitoringService.acknowledgeAlert(alertId, userId);
    if (!acknowledged) {
      throw new NotFoundError('Alert or alert is not in active state');
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Alert acknowledged successfully' },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error acknowledging alert:', error);
    next(error);
  }
});

// POST /api/monitoring/alerts/:alertId/resolve - Resolve an alert
router.post('/alerts/:alertId/resolve', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { alertId } = req.params;
    const resolved = monitoringService.resolveAlert(alertId);

    if (!resolved) {
      throw new NotFoundError('Alert');
    }

    const response: ApiResponse = {
      success: true,
      data: { message: 'Alert resolved successfully' },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error resolving alert:', error);
    next(error);
  }
});

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

// GET /api/monitoring/dashboard/:systemId - Get dashboard data for a system
router.get('/dashboard/:systemId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemId } = req.params;
    const { timeRange = '1h' } = req.query;

    // Calculate time range
    const endTime = new Date();
    let startTime = new Date();
    
    switch (timeRange) {
      case '5m':
        startTime = new Date(endTime.getTime() - 5 * 60 * 1000);
        break;
      case '15m':
        startTime = new Date(endTime.getTime() - 15 * 60 * 1000);
        break;
      case '1h':
        startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        startTime = new Date(endTime.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
    }

    // Get metrics and health data
    const metrics = monitoringService.getMetrics(systemId, startTime, endTime);
    const health = monitoringService.getSystemHealth(systemId);
    const alerts = monitoringService.getActiveAlerts(systemId);
    const alertRules = monitoringService.getAlertRules(systemId);

    // Group metrics by type and component
    const metricsByType = new Map<string, MetricData[]>();
    const metricsByComponent = new Map<string, MetricData[]>();

    metrics.forEach(metric => {
      // Group by type
      if (!metricsByType.has(metric.metricType)) {
        metricsByType.set(metric.metricType, []);
      }
      metricsByType.get(metric.metricType)!.push(metric);

      // Group by component
      if (!metricsByComponent.has(metric.componentId)) {
        metricsByComponent.set(metric.componentId, []);
      }
      metricsByComponent.get(metric.componentId)!.push(metric);
    });

    // Calculate summary statistics
    const summaryStats = {
      totalMetrics: metrics.length,
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      alertRules: alertRules.length,
      timeRange: {
        start: startTime,
        end: endTime,
        duration: timeRange
      }
    };

    const response: ApiResponse = {
      success: true,
      data: {
        health,
        metrics: Object.fromEntries(metricsByType),
        componentMetrics: Object.fromEntries(metricsByComponent),
        alerts,
        alertRules,
        summary: summaryStats
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    next(error);
  }
});

// GET /api/monitoring/overview - Get monitoring overview for all systems
router.get('/overview', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This would typically get systems for the authenticated user
    // For now, we'll return a general overview
    
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'Monitoring overview endpoint - implementation depends on user systems',
        features: [
          'Real-time metrics collection',
          'Configurable alert rules',
          'System health monitoring',
          'Performance dashboards',
          'Alert management'
        ]
      },
      timestamp: new Date()
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching monitoring overview:', error);
    next(error);
  }
});

export default router;