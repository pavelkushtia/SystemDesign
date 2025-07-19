import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';
import { database } from '../database/index';

export interface MetricData {
  timestamp: number;
  systemId: string;
  componentId: string;
  metricType: 'cpu' | 'memory' | 'network' | 'disk' | 'response_time' | 'error_rate' | 'throughput';
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

export interface AlertRule {
  id: string;
  systemId: string;
  componentId?: string;
  metricType: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  systemId: string;
  componentId?: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export class MonitoringService {
  private wss: WebSocketServer | null = null;
  private connectedClients: Map<string, WebSocket> = new Map();
  private metricsBuffer: MetricData[] = [];
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private metricsInterval: NodeJS.Timeout | null = null;
  private alertCheckInterval: NodeJS.Timeout | null = null;

  constructor(wss?: WebSocketServer) {
    this.wss = wss || null;
    this.loadAlertRules();
    this.startMetricsCollection();
    this.startAlertChecking();
  }

  /**
   * Initialize WebSocket server for real-time metrics
   */
  public initializeWebSocket(wss: WebSocketServer) {
    this.wss = wss;
    
    wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      this.connectedClients.set(clientId, ws);
      
      logger.info(`Monitoring client connected: ${clientId}`);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleClientMessage(clientId, data);
        } catch (error) {
          logger.error('Invalid monitoring message:', error);
        }
      });

      ws.on('close', () => {
        this.connectedClients.delete(clientId);
        logger.info(`Monitoring client disconnected: ${clientId}`);
      });

      // Send initial data
      this.sendInitialData(ws);
    });
  }

  /**
   * Record a metric data point
   */
  public recordMetric(metric: MetricData) {
    // Store in buffer for batch processing
    this.metricsBuffer.push(metric);

    // Store in database
    this.storeMetricInDatabase(metric);

    // Broadcast to connected clients
    this.broadcastMetric(metric);

    // Check for alert conditions
    this.checkAlertConditions(metric);
  }

  /**
   * Get metrics for a system within a time range
   */
  public getMetrics(
    systemId: string, 
    startTime: Date, 
    endTime: Date, 
    metricTypes?: string[]
  ): MetricData[] {
    let query = `
      SELECT * FROM metrics 
      WHERE system_id = ? AND timestamp BETWEEN ? AND ?
    `;
    const params: any[] = [systemId, startTime.getTime(), endTime.getTime()];

    if (metricTypes && metricTypes.length > 0) {
      query += ` AND metric_type IN (${metricTypes.map(() => '?').join(',')})`;
      params.push(...metricTypes);
    }

    query += ' ORDER BY timestamp ASC';

    const stmt = database.prepare(query);
    const results = stmt.all(...params);

    return results.map((row: any) => ({
      timestamp: row.timestamp,
      systemId: row.system_id,
      componentId: row.component_id,
      metricType: row.metric_type,
      value: row.value,
      unit: row.unit,
      tags: JSON.parse(row.tags || '{}')
    }));
  }

  /**
   * Create an alert rule
   */
  public createAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const alertRule: AlertRule = {
      id: this.generateId(),
      ...rule
    };

    this.alertRules.set(alertRule.id, alertRule);
    this.storeAlertRuleInDatabase(alertRule);

    logger.info(`Alert rule created: ${alertRule.id} for system ${alertRule.systemId}`);
    return alertRule;
  }

  /**
   * Update an alert rule
   */
  public updateAlertRule(ruleId: string, updates: Partial<AlertRule>): AlertRule | null {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates };
    this.alertRules.set(ruleId, updatedRule);
    this.updateAlertRuleInDatabase(updatedRule);

    return updatedRule;
  }

  /**
   * Delete an alert rule
   */
  public deleteAlertRule(ruleId: string): boolean {
    const deleted = this.alertRules.delete(ruleId);
    if (deleted) {
      this.deleteAlertRuleFromDatabase(ruleId);
    }
    return deleted;
  }

  /**
   * Get all alert rules for a system
   */
  public getAlertRules(systemId: string): AlertRule[] {
    return Array.from(this.alertRules.values())
      .filter(rule => rule.systemId === systemId);
  }

  /**
   * Get active alerts for a system
   */
  public getActiveAlerts(systemId: string): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.systemId === systemId && alert.status === 'active');
  }

  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string, userId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.status !== 'active') return false;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;

    this.updateAlertInDatabase(alert);
    this.broadcastAlert(alert);

    return true;
  }

  /**
   * Resolve an alert
   */
  public resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    this.updateAlertInDatabase(alert);
    this.broadcastAlert(alert);
    this.activeAlerts.delete(alertId);

    return true;
  }

  /**
   * Get system health summary
   */
  public getSystemHealth(systemId: string): {
    status: 'healthy' | 'warning' | 'critical';
    activeAlerts: number;
    criticalAlerts: number;
    lastUpdated: Date;
    components: Array<{
      id: string;
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      metrics: Record<string, number>;
    }>;
  } {
    const alerts = this.getActiveAlerts(systemId);
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const warningAlerts = alerts.filter(a => a.severity === 'medium' || a.severity === 'high').length;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts > 0) {
      status = 'critical';
    } else if (warningAlerts > 0) {
      status = 'warning';
    }

    // Get recent metrics for components
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 5 * 60 * 1000); // Last 5 minutes
    const recentMetrics = this.getMetrics(systemId, startTime, endTime);

    // Group metrics by component
    const componentMetrics = new Map<string, Record<string, number>>();
    recentMetrics.forEach(metric => {
      if (!componentMetrics.has(metric.componentId)) {
        componentMetrics.set(metric.componentId, {});
      }
      componentMetrics.get(metric.componentId)![metric.metricType] = metric.value;
    });

    const components = Array.from(componentMetrics.entries()).map(([componentId, metrics]) => {
      const componentAlerts = alerts.filter(a => a.componentId === componentId);
      const componentCritical = componentAlerts.filter(a => a.severity === 'critical').length;
      const componentWarning = componentAlerts.filter(a => a.severity === 'medium' || a.severity === 'high').length;

      let componentStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (componentCritical > 0) {
        componentStatus = 'critical';
      } else if (componentWarning > 0) {
        componentStatus = 'warning';
      }

      return {
        id: componentId,
        name: componentId, // TODO: Get actual component name
        status: componentStatus,
        metrics
      };
    });

    return {
      status,
      activeAlerts: alerts.length,
      criticalAlerts,
      lastUpdated: new Date(),
      components
    };
  }

  private handleClientMessage(clientId: string, data: any) {
    switch (data.type) {
      case 'subscribe':
        // Subscribe to specific system metrics
        this.subscribeClientToSystem(clientId, data.systemId);
        break;
      case 'unsubscribe':
        // Unsubscribe from system metrics
        this.unsubscribeClientFromSystem(clientId, data.systemId);
        break;
      default:
        logger.warn(`Unknown monitoring message type: ${data.type}`);
    }
  }

  private subscribeClientToSystem(clientId: string, systemId: string) {
    // Implementation for subscribing to specific system metrics
    logger.info(`Client ${clientId} subscribed to system ${systemId} metrics`);
  }

  private unsubscribeClientFromSystem(clientId: string, systemId: string) {
    // Implementation for unsubscribing from system metrics
    logger.info(`Client ${clientId} unsubscribed from system ${systemId} metrics`);
  }

  private sendInitialData(ws: WebSocket) {
    // Send current system status and recent metrics
    const initialData = {
      type: 'initial_data',
      timestamp: Date.now(),
      systems: this.getSystemsSummary()
    };

    ws.send(JSON.stringify(initialData));
  }

  private getSystemsSummary() {
    // Get summary of all monitored systems
    const stmt = database.prepare(`
      SELECT DISTINCT system_id FROM metrics 
      WHERE timestamp > ?
    `);
    const recentTime = Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours
    const systems = stmt.all(recentTime);

    return systems.map((row: any) => ({
      systemId: row.system_id,
      health: this.getSystemHealth(row.system_id)
    }));
  }

  private storeMetricInDatabase(metric: MetricData) {
    try {
      const stmt = database.prepare(`
        INSERT INTO metrics (
          timestamp, system_id, component_id, metric_type, 
          value, unit, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        metric.timestamp,
        metric.systemId,
        metric.componentId,
        metric.metricType,
        metric.value,
        metric.unit,
        JSON.stringify(metric.tags || {})
      );
    } catch (error) {
      logger.error('Failed to store metric in database:', error);
    }
  }

  private broadcastMetric(metric: MetricData) {
    const message = JSON.stringify({
      type: 'metric',
      data: metric
    });

    this.connectedClients.forEach((ws, clientId) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      } catch (error) {
        logger.error(`Failed to send metric to client ${clientId}:`, error);
      }
    });
  }

  private broadcastAlert(alert: Alert) {
    const message = JSON.stringify({
      type: 'alert',
      data: alert
    });

    this.connectedClients.forEach((ws, clientId) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      } catch (error) {
        logger.error(`Failed to send alert to client ${clientId}:`, error);
      }
    });
  }

  private checkAlertConditions(metric: MetricData) {
    const relevantRules = Array.from(this.alertRules.values())
      .filter(rule => 
        rule.enabled &&
        rule.systemId === metric.systemId &&
        rule.metricType === metric.metricType &&
        (!rule.componentId || rule.componentId === metric.componentId)
      );

    relevantRules.forEach(rule => {
      const conditionMet = this.evaluateCondition(rule, metric.value);
      
      if (conditionMet) {
        this.triggerAlert(rule, metric);
      }
    });
  }

  private evaluateCondition(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
      case 'greater_than':
        return value > rule.threshold;
      case 'less_than':
        return value < rule.threshold;
      case 'equals':
        return value === rule.threshold;
      case 'not_equals':
        return value !== rule.threshold;
      default:
        return false;
    }
  }

  private triggerAlert(rule: AlertRule, metric: MetricData) {
    // Check if alert already exists for this rule
    const existingAlert = Array.from(this.activeAlerts.values())
      .find(alert => 
        alert.ruleId === rule.id && 
        alert.status === 'active' &&
        alert.componentId === metric.componentId
      );

    if (existingAlert) {
      return; // Alert already active
    }

    const alert: Alert = {
      id: this.generateId(),
      ruleId: rule.id,
      systemId: rule.systemId,
      componentId: rule.componentId,
      message: `${rule.metricType} ${rule.condition.replace('_', ' ')} ${rule.threshold} (current: ${metric.value})`,
      severity: rule.severity,
      status: 'active',
      triggeredAt: new Date()
    };

    this.activeAlerts.set(alert.id, alert);
    this.storeAlertInDatabase(alert);
    this.broadcastAlert(alert);

    logger.warn(`Alert triggered: ${alert.message} for system ${alert.systemId}`);
  }

  private loadAlertRules() {
    try {
      const stmt = database.prepare('SELECT * FROM alert_rules WHERE enabled = 1');
      const rules = stmt.all();

      rules.forEach((row: any) => {
        const rule: AlertRule = {
          id: row.id,
          systemId: row.system_id,
          componentId: row.component_id,
          metricType: row.metric_type,
          condition: row.condition,
          threshold: row.threshold,
          duration: row.duration,
          severity: row.severity,
          enabled: row.enabled === 1,
          notificationChannels: JSON.parse(row.notification_channels || '[]')
        };
        this.alertRules.set(rule.id, rule);
      });

      logger.info(`Loaded ${rules.length} alert rules`);
    } catch (error) {
      logger.error('Failed to load alert rules:', error);
    }
  }

  private storeAlertRuleInDatabase(rule: AlertRule) {
    try {
      const stmt = database.prepare(`
        INSERT INTO alert_rules (
          id, system_id, component_id, metric_type, condition,
          threshold, duration, severity, enabled, notification_channels
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        rule.id,
        rule.systemId,
        rule.componentId,
        rule.metricType,
        rule.condition,
        rule.threshold,
        rule.duration,
        rule.severity,
        rule.enabled ? 1 : 0,
        JSON.stringify(rule.notificationChannels)
      );
    } catch (error) {
      logger.error('Failed to store alert rule:', error);
    }
  }

  private updateAlertRuleInDatabase(rule: AlertRule) {
    try {
      const stmt = database.prepare(`
        UPDATE alert_rules SET
          component_id = ?, metric_type = ?, condition = ?,
          threshold = ?, duration = ?, severity = ?, enabled = ?,
          notification_channels = ?
        WHERE id = ?
      `);

      stmt.run(
        rule.componentId,
        rule.metricType,
        rule.condition,
        rule.threshold,
        rule.duration,
        rule.severity,
        rule.enabled ? 1 : 0,
        JSON.stringify(rule.notificationChannels),
        rule.id
      );
    } catch (error) {
      logger.error('Failed to update alert rule:', error);
    }
  }

  private deleteAlertRuleFromDatabase(ruleId: string) {
    try {
      const stmt = database.prepare('DELETE FROM alert_rules WHERE id = ?');
      stmt.run(ruleId);
    } catch (error) {
      logger.error('Failed to delete alert rule:', error);
    }
  }

  private storeAlertInDatabase(alert: Alert) {
    try {
      const stmt = database.prepare(`
        INSERT INTO alerts (
          id, rule_id, system_id, component_id, message,
          severity, status, triggered_at, resolved_at,
          acknowledged_at, acknowledged_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        alert.id,
        alert.ruleId,
        alert.systemId,
        alert.componentId,
        alert.message,
        alert.severity,
        alert.status,
        alert.triggeredAt.toISOString(),
        alert.resolvedAt?.toISOString(),
        alert.acknowledgedAt?.toISOString(),
        alert.acknowledgedBy
      );
    } catch (error) {
      logger.error('Failed to store alert:', error);
    }
  }

  private updateAlertInDatabase(alert: Alert) {
    try {
      const stmt = database.prepare(`
        UPDATE alerts SET
          status = ?, resolved_at = ?, acknowledged_at = ?, acknowledged_by = ?
        WHERE id = ?
      `);

      stmt.run(
        alert.status,
        alert.resolvedAt?.toISOString(),
        alert.acknowledgedAt?.toISOString(),
        alert.acknowledgedBy,
        alert.id
      );
    } catch (error) {
      logger.error('Failed to update alert:', error);
    }
  }

  private startMetricsCollection() {
    // Simulate metrics collection every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.generateSimulatedMetrics();
    }, 30000);
  }

  private startAlertChecking() {
    // Check for alert conditions every 10 seconds
    this.alertCheckInterval = setInterval(() => {
      this.checkForResolvedAlerts();
    }, 10000);
  }

  private generateSimulatedMetrics() {
    // Generate some simulated metrics for demo purposes
    const systems = this.getSystemsSummary();
    
    systems.forEach(({ systemId }) => {
      const components = ['api-gateway', 'user-service', 'database'];
      
      components.forEach(componentId => {
        // CPU usage
        this.recordMetric({
          timestamp: Date.now(),
          systemId,
          componentId,
          metricType: 'cpu',
          value: Math.random() * 100,
          unit: 'percent'
        });

        // Memory usage
        this.recordMetric({
          timestamp: Date.now(),
          systemId,
          componentId,
          metricType: 'memory',
          value: Math.random() * 100,
          unit: 'percent'
        });

        // Response time
        this.recordMetric({
          timestamp: Date.now(),
          systemId,
          componentId,
          metricType: 'response_time',
          value: Math.random() * 1000,
          unit: 'milliseconds'
        });
      });
    });
  }

  private checkForResolvedAlerts() {
    // Check if any active alerts should be auto-resolved
    // This is a simplified implementation
    Array.from(this.activeAlerts.values())
      .filter(alert => alert.status === 'active')
      .forEach(alert => {
        // Auto-resolve alerts older than 1 hour for demo
        const hourAgo = Date.now() - 60 * 60 * 1000;
        if (alert.triggeredAt.getTime() < hourAgo) {
          this.resolveAlert(alert.id);
        }
      });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateClientId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public cleanup() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
    }
  }
}