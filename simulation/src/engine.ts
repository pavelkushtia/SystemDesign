import { SimulationConfig, SimulationResult, Component, Connection } from '@scalesim/shared';

export interface SimulationMetrics {
  timestamp: number;
  latency: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  networkIO: number;
}

export interface ComponentPerformance {
  componentId: string;
  componentType: string;
  metrics: {
    requestsHandled: number;
    averageLatency: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    networkIn: number;
    networkOut: number;
  };
  bottlenecks: string[];
  recommendations: string[];
}

export class SimulationEngine {
  private simulationData: Map<string, SimulationMetrics[]> = new Map();

  async runSimulation(config: SimulationConfig): Promise<SimulationResult> {
    const simulationId = `sim-${Date.now()}`;
    
    // Get system components and connections
    const { components, connections } = await this.getSystemTopology(config.systemId);
    
    // Run simulation phases
    const metrics = await this.executeSimulation(simulationId, config, components, connections);
    const componentMetrics = await this.analyzeComponentPerformance(components, connections, config);
    const resourceUtilization = await this.calculateResourceUtilization(components, config);
    const bottlenecks = await this.detectBottlenecks(componentMetrics, connections);
    const costEstimation = await this.estimateCosts(resourceUtilization, config);

    return {
      id: simulationId,
      configId: config.id,
      metrics,
      componentMetrics: this.formatComponentMetrics(componentMetrics),
      resourceUtilization: {
        ...resourceUtilization,
        estimatedCost: costEstimation.totalCost
      },
      bottlenecks,
      executedAt: new Date(),
      duration: config.duration,
      recommendations: await this.generateRecommendations(componentMetrics, bottlenecks),
      performanceScore: this.calculatePerformanceScore(metrics, componentMetrics)
    };
  }

  private async getSystemTopology(systemId: string): Promise<{ components: Component[], connections: Connection[] }> {
    // In a real implementation, this would fetch from database
    // For now, return mock data
    return {
      components: [
        { id: 'lb-1', type: 'load_balancer', name: 'Load Balancer', position: { x: 0, y: 0 }, config: {} },
        { id: 'api-1', type: 'api_gateway', name: 'API Gateway', position: { x: 200, y: 0 }, config: {} },
        { id: 'svc-1', type: 'microservice', name: 'User Service', position: { x: 400, y: 0 }, config: {} },
        { id: 'db-1', type: 'database', name: 'PostgreSQL', position: { x: 600, y: 0 }, config: {} },
        { id: 'cache-1', type: 'cache', name: 'Redis', position: { x: 400, y: 200 }, config: {} }
      ],
      connections: [
        { id: 'conn-1', source: 'lb-1', target: 'api-1', type: 'http' },
        { id: 'conn-2', source: 'api-1', target: 'svc-1', type: 'http' },
        { id: 'conn-3', source: 'svc-1', target: 'db-1', type: 'tcp' },
        { id: 'conn-4', source: 'svc-1', target: 'cache-1', type: 'tcp' }
      ]
    };
  }

  private async executeSimulation(
    simulationId: string, 
    config: SimulationConfig, 
    components: Component[], 
    connections: Connection[]
  ): Promise<any> {
    const totalRequests = config.users * config.requestsPerSecond * config.duration;
    const simulationSteps = Math.min(config.duration, 300); // Max 300 data points
    const stepDuration = config.duration / simulationSteps;
    
    const metrics: SimulationMetrics[] = [];
    
    for (let step = 0; step < simulationSteps; step++) {
      const timestamp = Date.now() + (step * stepDuration * 1000);
      const progress = step / simulationSteps;
      
      // Simulate traffic patterns
      const trafficMultiplier = this.getTrafficMultiplier(config.trafficPattern, progress);
      const currentRPS = config.requestsPerSecond * trafficMultiplier;
      
      // Calculate latency based on system complexity and load
      const baseLatency = this.calculateBaseLatency(components, connections);
      const loadFactor = Math.max(1, currentRPS / 100); // Latency increases with load
      const latency = baseLatency * loadFactor + this.addJitter(20);
      
      // Calculate error rate based on load and failure scenarios
      const errorRate = this.calculateErrorRate(config, currentRPS, progress);
      
      // Calculate resource usage
      const cpuUsage = Math.min(100, (currentRPS / 10) + this.addJitter(10));
      const memoryUsage = Math.min(100, 30 + (currentRPS / 20) + this.addJitter(5));
      const networkIO = currentRPS * 1.5; // KB/s
      
      metrics.push({
        timestamp,
        latency,
        throughput: currentRPS * (1 - errorRate),
        errorRate,
        cpuUsage,
        memoryUsage,
        networkIO
      });
    }
    
    this.simulationData.set(simulationId, metrics);
    
    // Calculate aggregate metrics
    const avgLatency = metrics.reduce((sum, m) => sum + m.latency, 0) / metrics.length;
    const avgThroughput = metrics.reduce((sum, m) => sum + m.throughput, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;
    
    const sortedLatencies = metrics.map(m => m.latency).sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p99Index = Math.floor(sortedLatencies.length * 0.99);
    
    return {
      totalRequests,
      successfulRequests: Math.round(totalRequests * (1 - avgErrorRate)),
      failedRequests: Math.round(totalRequests * avgErrorRate),
      averageLatency: Math.round(avgLatency),
      p95Latency: Math.round(sortedLatencies[p95Index] || avgLatency),
      p99Latency: Math.round(sortedLatencies[p99Index] || avgLatency),
      throughput: Math.round(avgThroughput),
      errorRate: avgErrorRate,
      timeSeriesData: metrics
    };
  }

  private async analyzeComponentPerformance(
    components: Component[], 
    connections: Connection[], 
    config: SimulationConfig
  ): Promise<ComponentPerformance[]> {
    return components.map(component => {
      const incomingConnections = connections.filter(c => c.target === component.id);
      const outgoingConnections = connections.filter(c => c.source === component.id);
      
      // Calculate load distribution
      const loadFactor = this.calculateComponentLoad(component, incomingConnections.length, config);
      const baseLatency = this.getComponentBaseLatency(component.type);
      
      const performance: ComponentPerformance = {
        componentId: component.id,
        componentType: component.type,
        metrics: {
          requestsHandled: Math.round(config.requestsPerSecond * config.duration * loadFactor),
          averageLatency: Math.round(baseLatency * (1 + loadFactor)),
          errorRate: this.getComponentErrorRate(component.type, loadFactor),
          cpuUsage: Math.min(100, 20 + (loadFactor * 60)),
          memoryUsage: Math.min(100, 15 + (loadFactor * 40)),
          networkIn: Math.round(config.requestsPerSecond * loadFactor * 2), // KB/s
          networkOut: Math.round(config.requestsPerSecond * loadFactor * 1.5) // KB/s
        },
        bottlenecks: [],
        recommendations: []
      };

      // Detect component-specific bottlenecks
      if (performance.metrics.cpuUsage > 80) {
        performance.bottlenecks.push('High CPU usage');
        performance.recommendations.push('Consider horizontal scaling or CPU optimization');
      }
      
      if (performance.metrics.memoryUsage > 80) {
        performance.bottlenecks.push('High memory usage');
        performance.recommendations.push('Increase memory allocation or optimize memory usage');
      }
      
      if (performance.metrics.errorRate > 0.05) {
        performance.bottlenecks.push('High error rate');
        performance.recommendations.push('Investigate error causes and implement retry mechanisms');
      }

      return performance;
    });
  }

  private async calculateResourceUtilization(components: Component[], config: SimulationConfig) {
    const totalComponents = components.length;
    const loadFactor = config.requestsPerSecond / 100; // Normalize load
    
    return {
      totalCPU: Math.min(100, 20 + (totalComponents * 15) + (loadFactor * 20)),
      totalMemory: Math.round(512 + (totalComponents * 256) + (loadFactor * 512)), // MB
      totalStorage: Math.round(10 + (totalComponents * 5) + (loadFactor * 2)), // GB
      networkBandwidth: Math.round(config.requestsPerSecond * 2), // KB/s
      activeConnections: config.users
    };
  }

  private async detectBottlenecks(componentMetrics: ComponentPerformance[], connections: Connection[]): Promise<string[]> {
    const bottlenecks: string[] = [];
    
    // Analyze component bottlenecks
    componentMetrics.forEach(comp => {
      if (comp.metrics.cpuUsage > 80) {
        bottlenecks.push(`${comp.componentId}: CPU bottleneck (${comp.metrics.cpuUsage}%)`);
      }
      if (comp.metrics.memoryUsage > 80) {
        bottlenecks.push(`${comp.componentId}: Memory bottleneck (${comp.metrics.memoryUsage}%)`);
      }
      if (comp.metrics.errorRate > 0.1) {
        bottlenecks.push(`${comp.componentId}: High error rate (${(comp.metrics.errorRate * 100).toFixed(1)}%)`);
      }
    });
    
    // Analyze connection bottlenecks
    const connectionLoad = new Map<string, number>();
    connections.forEach(conn => {
      const sourceComp = componentMetrics.find(c => c.componentId === conn.source);
      if (sourceComp) {
        const load = sourceComp.metrics.networkOut;
        connectionLoad.set(conn.id, load);
        
        if (load > 1000) { // KB/s threshold
          bottlenecks.push(`${conn.source} -> ${conn.target}: High network traffic (${load} KB/s)`);
        }
      }
    });
    
    return bottlenecks;
  }

  private async estimateCosts(resourceUtilization: any, config: SimulationConfig) {
    // Simple cost estimation based on resource usage
    const cpuCost = (resourceUtilization.totalCPU / 100) * 0.05; // $0.05 per CPU hour
    const memoryCost = (resourceUtilization.totalMemory / 1024) * 0.01; // $0.01 per GB hour
    const storageCost = (resourceUtilization.totalStorage / 1024) * 0.001; // $0.001 per GB hour
    const networkCost = (resourceUtilization.networkBandwidth / 1024) * 0.02; // $0.02 per MB hour
    
    const hourlyRate = cpuCost + memoryCost + storageCost + networkCost;
    const totalCost = hourlyRate * (config.duration / 3600); // Convert seconds to hours
    
    return {
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      breakdown: {
        cpu: Math.round(cpuCost * 100) / 100,
        memory: Math.round(memoryCost * 100) / 100,
        storage: Math.round(storageCost * 100) / 100,
        network: Math.round(networkCost * 100) / 100
      }
    };
  }

  private async generateRecommendations(componentMetrics: ComponentPerformance[], bottlenecks: string[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    // General recommendations based on bottlenecks
    if (bottlenecks.some(b => b.includes('CPU bottleneck'))) {
      recommendations.push('Consider implementing horizontal pod autoscaling for CPU-intensive components');
      recommendations.push('Review and optimize CPU-intensive algorithms');
    }
    
    if (bottlenecks.some(b => b.includes('Memory bottleneck'))) {
      recommendations.push('Implement memory caching strategies');
      recommendations.push('Consider increasing memory limits for affected components');
    }
    
    if (bottlenecks.some(b => b.includes('High error rate'))) {
      recommendations.push('Implement circuit breaker pattern for fault tolerance');
      recommendations.push('Add retry mechanisms with exponential backoff');
    }
    
    if (bottlenecks.some(b => b.includes('High network traffic'))) {
      recommendations.push('Consider implementing data compression');
      recommendations.push('Optimize API payload sizes');
      recommendations.push('Implement connection pooling');
    }
    
    // Component-specific recommendations
    const dbComponents = componentMetrics.filter(c => c.componentType === 'database');
    if (dbComponents.some(c => c.metrics.cpuUsage > 70)) {
      recommendations.push('Consider database read replicas for read-heavy workloads');
      recommendations.push('Implement database connection pooling');
    }
    
    const cacheComponents = componentMetrics.filter(c => c.componentType === 'cache');
    if (cacheComponents.length === 0 && componentMetrics.length > 3) {
      recommendations.push('Consider adding caching layer to reduce database load');
    }
    
    return recommendations;
  }

  private calculatePerformanceScore(metrics: any, componentMetrics: ComponentPerformance[]): number {
    let score = 100;
    
    // Deduct points for high latency
    if (metrics.averageLatency > 500) score -= 20;
    else if (metrics.averageLatency > 200) score -= 10;
    
    // Deduct points for high error rate
    if (metrics.errorRate > 0.1) score -= 30;
    else if (metrics.errorRate > 0.05) score -= 15;
    
    // Deduct points for low throughput
    const expectedThroughput = metrics.totalRequests / (metrics.duration || 1);
    if (metrics.throughput < expectedThroughput * 0.8) score -= 20;
    
    // Deduct points for component bottlenecks
    const bottleneckCount = componentMetrics.reduce((count, comp) => count + comp.bottlenecks.length, 0);
    score -= bottleneckCount * 5;
    
    return Math.max(0, Math.round(score));
  }

  // Helper methods
  private getTrafficMultiplier(pattern: string, progress: number): number {
    switch (pattern) {
      case 'spike':
        return progress < 0.1 ? 1 + (progress * 40) : progress > 0.9 ? 5 - ((progress - 0.9) * 40) : 5;
      case 'gradual':
        return 1 + (progress * 3);
      case 'constant':
      default:
        return 1;
    }
  }

  private calculateBaseLatency(components: Component[], connections: Connection[]): number {
    const componentLatencies = {
      'load_balancer': 5,
      'api_gateway': 10,
      'microservice': 50,
      'database': 20,
      'cache': 2,
      'message_queue': 5
    };
    
    let totalLatency = 0;
    components.forEach(comp => {
      totalLatency += componentLatencies[comp.type as keyof typeof componentLatencies] || 30;
    });
    
    // Add network latency for connections
    totalLatency += connections.length * 2;
    
    return totalLatency;
  }

  private calculateErrorRate(config: SimulationConfig, currentRPS: number, progress: number): number {
    let baseErrorRate = 0.01; // 1% base error rate
    
    // Increase error rate with load
    if (currentRPS > 200) baseErrorRate += 0.02;
    if (currentRPS > 500) baseErrorRate += 0.03;
    
    // Apply failure scenarios
    config.failureScenarios?.forEach(scenario => {
      if (scenario.type === 'network_partition' && progress > 0.3 && progress < 0.7) {
        baseErrorRate += 0.1;
      }
      if (scenario.type === 'service_failure' && progress > 0.5 && progress < 0.6) {
        baseErrorRate += 0.2;
      }
    });
    
    return Math.min(0.5, baseErrorRate); // Cap at 50%
  }

  private addJitter(maxJitter: number): number {
    return (Math.random() - 0.5) * maxJitter;
  }

  private calculateComponentLoad(component: Component, incomingConnections: number, config: SimulationConfig): number {
    const baseLoad = 0.3;
    const connectionLoad = incomingConnections * 0.2;
    const trafficLoad = (config.requestsPerSecond / 100) * 0.3;
    
    return Math.min(1, baseLoad + connectionLoad + trafficLoad);
  }

  private getComponentBaseLatency(componentType: string): number {
    const latencies = {
      'load_balancer': 5,
      'api_gateway': 15,
      'microservice': 80,
      'database': 30,
      'cache': 3,
      'message_queue': 8,
      'ml_model': 150
    };
    
    return latencies[componentType as keyof typeof latencies] || 50;
  }

  private getComponentErrorRate(componentType: string, loadFactor: number): number {
    const baseErrorRates = {
      'load_balancer': 0.001,
      'api_gateway': 0.005,
      'microservice': 0.02,
      'database': 0.01,
      'cache': 0.001,
      'message_queue': 0.005,
      'ml_model': 0.03
    };
    
    const baseRate = baseErrorRates[componentType as keyof typeof baseErrorRates] || 0.02;
    return Math.min(0.2, baseRate * (1 + loadFactor));
  }

  private formatComponentMetrics(componentMetrics: ComponentPerformance[]): Record<string, any> {
    const formatted: Record<string, any> = {};
    
    componentMetrics.forEach(comp => {
      formatted[comp.componentId] = {
        type: comp.componentType,
        metrics: comp.metrics,
        bottlenecks: comp.bottlenecks,
        recommendations: comp.recommendations
      };
    });
    
    return formatted;
  }

  // Public method to get real-time simulation data
  public getSimulationData(simulationId: string): SimulationMetrics[] | undefined {
    return this.simulationData.get(simulationId);
  }

  // Public method to clean up old simulation data
  public cleanupSimulationData(maxAge: number = 3600000): void { // 1 hour default
    const cutoff = Date.now() - maxAge;
    
    for (const [simulationId, metrics] of this.simulationData.entries()) {
      if (metrics.length > 0 && metrics[0].timestamp < cutoff) {
        this.simulationData.delete(simulationId);
      }
    }
  }
} 