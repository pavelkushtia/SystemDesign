export interface ComponentMetrics {
  id: string;
  type: string;
  cpu: number;        // CPU utilization %
  memory: number;     // Memory utilization %
  latency: number;    // Response time in ms
  throughput: number; // Requests per second
  errorRate: number;  // Error rate %
  connections: number;// Active connections
}

export interface SystemMetrics {
  totalLatency: number;
  totalThroughput: number;
  totalErrorRate: number;
  totalCost: number;
  bottlenecks: string[];
  recommendations: string[];
  components: ComponentMetrics[];
}

export interface LoadPattern {
  users: number;
  duration: number; // seconds
  rampUp: number;   // seconds
  requestsPerSecond: number;
  pattern: 'constant' | 'spike' | 'ramp' | 'wave';
}

export interface ComponentConfig {
  id: string;
  type: string;
  name: string;
  specs: {
    cpu: number;      // CPU cores
    memory: number;   // Memory in GB
    storage: number;  // Storage in GB
    network: number;  // Network bandwidth in Mbps
  };
  scaling: {
    min: number;
    max: number;
    auto: boolean;
  };
  connections: ComponentConnection[];
}

export interface ComponentConnection {
  from: string;
  to: string;
  type: 'sync' | 'async' | 'database' | 'cache';
  weight: number; // Request distribution weight
}

export class SimulationEngine {
  
  static simulateSystem(components: ComponentConfig[], load: LoadPattern): SystemMetrics {
    const duration = load.duration;
    const totalRequests = load.requestsPerSecond * duration;
    
    // Calculate component metrics
    const componentMetrics = components.map(component => 
      this.calculateComponentMetrics(component, load, components)
    );
    
    // Calculate system-wide metrics
    const systemMetrics = this.calculateSystemMetrics(componentMetrics, load);
    
    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(componentMetrics);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(componentMetrics, bottlenecks);
    
    return {
      ...systemMetrics,
      bottlenecks,
      recommendations,
      components: componentMetrics
    };
  }
  
  private static calculateComponentMetrics(
    component: ComponentConfig, 
    load: LoadPattern, 
    allComponents: ComponentConfig[]
  ): ComponentMetrics {
    
    // Calculate load distribution based on connections
    const incomingLoad = this.calculateIncomingLoad(component, load, allComponents);
    
    // Base performance characteristics by component type
    const baseMetrics = this.getBaseMetrics(component.type);
    
    // Calculate resource utilization
    const cpu = this.calculateCPUUtilization(component, incomingLoad);
    const memory = this.calculateMemoryUtilization(component, incomingLoad);
    
    // Calculate latency based on load and resources
    const latency = this.calculateLatency(component, incomingLoad, cpu, memory);
    
    // Calculate throughput
    const throughput = this.calculateThroughput(component, incomingLoad, cpu);
    
    // Calculate error rate
    const errorRate = this.calculateErrorRate(cpu, memory, component.type);
    
    // Active connections
    const connections = Math.min(incomingLoad * 0.1, component.specs.network / 10);
    
    return {
      id: component.id,
      type: component.type,
      cpu: Math.min(cpu, 100),
      memory: Math.min(memory, 100),
      latency,
      throughput,
      errorRate,
      connections
    };
  }
  
  private static getBaseMetrics(componentType: string): { baseLatency: number; baseThroughput: number; cpuIntensity: number } {
    const metrics: Record<string, { baseLatency: number; baseThroughput: number; cpuIntensity: number }> = {
      'api-gateway': { baseLatency: 5, baseThroughput: 5000, cpuIntensity: 0.6 },
      'load-balancer': { baseLatency: 2, baseThroughput: 10000, cpuIntensity: 0.4 },
      'microservice': { baseLatency: 50, baseThroughput: 1000, cpuIntensity: 0.8 },
      'database': { baseLatency: 10, baseThroughput: 2000, cpuIntensity: 0.7 },
      'cache': { baseLatency: 1, baseThroughput: 50000, cpuIntensity: 0.3 },
      'message-queue': { baseLatency: 3, baseThroughput: 20000, cpuIntensity: 0.5 },
      'ml-model': { baseLatency: 200, baseThroughput: 100, cpuIntensity: 0.9 },
      'cdn': { baseLatency: 20, baseThroughput: 5000, cpuIntensity: 0.2 },
      'elasticsearch': { baseLatency: 30, baseThroughput: 3000, cpuIntensity: 0.8 },
      'mongodb': { baseLatency: 15, baseThroughput: 5000, cpuIntensity: 0.6 },
      'postgresql': { baseLatency: 8, baseThroughput: 8000, cpuIntensity: 0.7 },
      'redis': { baseLatency: 0.5, baseThroughput: 100000, cpuIntensity: 0.2 },
      'kafka': { baseLatency: 5, baseThroughput: 15000, cpuIntensity: 0.6 },
      'nginx': { baseLatency: 1, baseThroughput: 10000, cpuIntensity: 0.3 }
    };
    
    return metrics[componentType] || { baseLatency: 50, baseThroughput: 1000, cpuIntensity: 0.7 };
  }
  
  private static calculateIncomingLoad(
    component: ComponentConfig, 
    load: LoadPattern, 
    allComponents: ComponentConfig[]
  ): number {
    // Find all components that connect to this component
    const incomingConnections = allComponents.flatMap(comp => 
      comp.connections.filter(conn => conn.to === component.id)
    );
    
    if (incomingConnections.length === 0) {
      // This is an entry point (like API Gateway)
      return load.requestsPerSecond;
    }
    
    // Calculate weighted load distribution
    const totalWeight = incomingConnections.reduce((sum, conn) => sum + conn.weight, 0);
    const avgWeight = totalWeight / incomingConnections.length;
    
    // Apply multiplier based on connection type
    const connectionMultiplier = this.getConnectionMultiplier(incomingConnections[0]?.type);
    
    return (load.requestsPerSecond * avgWeight) * connectionMultiplier;
  }
  
  private static getConnectionMultiplier(connectionType: string | undefined): number {
    const multipliers: Record<string, number> = {
      'sync': 1.0,     // 1:1 request mapping
      'async': 0.8,    // Some requests are batched
      'database': 1.2, // Multiple queries per request
      'cache': 1.5     // Multiple cache operations
    };
    
    return multipliers[connectionType || 'sync'] || 1.0;
  }
  
  private static calculateCPUUtilization(component: ComponentConfig, load: number): number {
    const baseMetrics = this.getBaseMetrics(component.type);
    const capacity = component.specs.cpu * 1000; // Convert cores to capacity units
    
    // CPU utilization based on load vs capacity
    const baseUtilization = (load / capacity) * 100 * baseMetrics.cpuIntensity;
    
    // Add some randomness for realism
    const variance = (Math.random() - 0.5) * 10;
    
    return Math.max(0, baseUtilization + variance);
  }
  
  private static calculateMemoryUtilization(component: ComponentConfig, load: number): number {
    const baseMetrics = this.getBaseMetrics(component.type);
    const memoryCapacity = component.specs.memory * 1024; // Convert GB to MB
    
    // Memory utilization grows more slowly than CPU
    const memoryPerRequest = this.getMemoryPerRequest(component.type);
    const activeRequests = load * (baseMetrics.baseLatency / 1000); // Requests in flight
    
    const memoryUsage = (activeRequests * memoryPerRequest / memoryCapacity) * 100;
    
    // Add base memory usage
    const baseMemoryUsage = this.getBaseMemoryUsage(component.type);
    
    return Math.max(baseMemoryUsage, memoryUsage + baseMemoryUsage);
  }
  
  private static getMemoryPerRequest(componentType: string): number {
    const memoryMap: Record<string, number> = {
      'api-gateway': 0.1,     // 0.1 MB per request
      'microservice': 2,      // 2 MB per request
      'database': 0.5,        // 0.5 MB per query
      'cache': 0.01,          // 0.01 MB per cache operation
      'ml-model': 50,         // 50 MB per inference
      'elasticsearch': 5,     // 5 MB per search
      'mongodb': 1,           // 1 MB per document operation
      'postgresql': 0.8,      // 0.8 MB per query
      'redis': 0.005,         // 0.005 MB per operation
      'kafka': 0.1            // 0.1 MB per message
    };
    
    return memoryMap[componentType] || 1;
  }
  
  private static getBaseMemoryUsage(componentType: string): number {
    const baseMap: Record<string, number> = {
      'api-gateway': 15,
      'microservice': 25,
      'database': 40,
      'cache': 20,
      'ml-model': 60,
      'elasticsearch': 50,
      'mongodb': 35,
      'postgresql': 30,
      'redis': 10,
      'kafka': 25
    };
    
    return baseMap[componentType] || 20;
  }
  
  private static calculateLatency(
    component: ComponentConfig, 
    load: number, 
    cpu: number, 
    memory: number
  ): number {
    const baseMetrics = this.getBaseMetrics(component.type);
    let latency = baseMetrics.baseLatency;
    
    // Latency increases with resource utilization
    if (cpu > 70) {
      latency *= (1 + (cpu - 70) / 100); // Exponential increase after 70%
    }
    
    if (memory > 80) {
      latency *= (1 + (memory - 80) / 50); // Memory pressure
    }
    
    // Network latency based on load
    if (load > component.specs.network * 100) {
      latency *= 1.5; // Network bottleneck
    }
    
    // Add jitter
    const jitter = (Math.random() - 0.5) * latency * 0.2;
    
    return Math.max(1, latency + jitter);
  }
  
  private static calculateThroughput(
    component: ComponentConfig, 
    load: number, 
    cpu: number
  ): number {
    const baseMetrics = this.getBaseMetrics(component.type);
    let maxThroughput = baseMetrics.baseThroughput;
    
    // Scale with CPU cores
    maxThroughput *= component.specs.cpu;
    
    // Throughput degrades with high CPU usage
    if (cpu > 80) {
      maxThroughput *= Math.max(0.1, (100 - cpu) / 20);
    }
    
    // Can't exceed incoming load
    return Math.min(load, maxThroughput);
  }
  
  private static calculateErrorRate(cpu: number, memory: number, componentType: string): number {
    let errorRate = 0;
    
    // Base error rates by component type
    const baseErrorRates: Record<string, number> = {
      'api-gateway': 0.1,
      'microservice': 0.2,
      'database': 0.05,
      'cache': 0.01,
      'ml-model': 0.5,
      'message-queue': 0.02
    };
    
    errorRate = baseErrorRates[componentType] || 0.1;
    
    // Error rate increases with resource pressure
    if (cpu > 85) {
      errorRate += (cpu - 85) * 0.1; // 0.1% per % over 85%
    }
    
    if (memory > 90) {
      errorRate += (memory - 90) * 0.2; // 0.2% per % over 90%
    }
    
    return Math.min(errorRate, 10); // Cap at 10%
  }
  
  private static calculateSystemMetrics(
    componentMetrics: ComponentMetrics[], 
    load: LoadPattern
  ): SystemMetrics {
    
    // Calculate end-to-end latency (sum of critical path)
    const totalLatency = componentMetrics
      .filter(c => ['api-gateway', 'microservice', 'database'].includes(c.type))
      .reduce((sum, c) => sum + c.latency, 0);
    
    // System throughput is limited by the slowest component
    const totalThroughput = Math.min(...componentMetrics.map(c => c.throughput));
    
    // System error rate is combined probability
    const totalErrorRate = componentMetrics.reduce((rate, c) => 
      rate + c.errorRate - (rate * c.errorRate / 100), 0
    );
    
    // Calculate cost (simplified)
    const totalCost = this.calculateSystemCost(componentMetrics);
    
    return {
      totalLatency,
      totalThroughput,
      totalErrorRate,
      totalCost,
      bottlenecks: [],
      recommendations: [],
      components: componentMetrics
    };
  }
  
  private static calculateSystemCost(componentMetrics: ComponentMetrics[]): number {
    // AWS-like pricing (per hour)
    const costMap: Record<string, number> = {
      'api-gateway': 0.05,
      'load-balancer': 0.025,
      'microservice': 0.10,
      'database': 0.15,
      'cache': 0.08,
      'ml-model': 0.50,
      'elasticsearch': 0.20,
      'mongodb': 0.12,
      'postgresql': 0.10,
      'redis': 0.05,
      'kafka': 0.15
    };
    
    return componentMetrics.reduce((total, component) => {
      const baseCost = costMap[component.type] || 0.10;
      const utilizationMultiplier = 1 + (component.cpu / 100) * 0.5; // Higher utilization = higher cost
      return total + (baseCost * utilizationMultiplier);
    }, 0);
  }
  
  private static identifyBottlenecks(componentMetrics: ComponentMetrics[]): string[] {
    const bottlenecks: string[] = [];
    
    componentMetrics.forEach(component => {
      if (component.cpu > 80) {
        bottlenecks.push(`${component.id}: High CPU utilization (${component.cpu.toFixed(1)}%)`);
      }
      
      if (component.memory > 85) {
        bottlenecks.push(`${component.id}: High memory usage (${component.memory.toFixed(1)}%)`);
      }
      
      if (component.latency > 1000) {
        bottlenecks.push(`${component.id}: High latency (${component.latency.toFixed(0)}ms)`);
      }
      
      if (component.errorRate > 1) {
        bottlenecks.push(`${component.id}: High error rate (${component.errorRate.toFixed(1)}%)`);
      }
    });
    
    return bottlenecks;
  }
  
  private static generateRecommendations(
    componentMetrics: ComponentMetrics[], 
    bottlenecks: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    componentMetrics.forEach(component => {
      if (component.cpu > 80) {
        recommendations.push(`Scale out ${component.id} to reduce CPU load`);
        recommendations.push(`Consider adding horizontal pod autoscaling for ${component.id}`);
      }
      
      if (component.memory > 85) {
        recommendations.push(`Increase memory allocation for ${component.id}`);
        if (component.type === 'database') {
          recommendations.push(`Optimize queries and add connection pooling for ${component.id}`);
        }
      }
      
      if (component.latency > 500 && component.type === 'microservice') {
        recommendations.push(`Add caching layer in front of ${component.id}`);
        recommendations.push(`Consider async processing for ${component.id}`);
      }
      
      if (component.errorRate > 0.5) {
        recommendations.push(`Implement circuit breaker pattern for ${component.id}`);
        recommendations.push(`Add retry logic with exponential backoff for ${component.id}`);
      }
    });
    
    // System-level recommendations
    if (bottlenecks.length > 2) {
      recommendations.push('Consider implementing a service mesh for better observability');
      recommendations.push('Add distributed tracing to identify performance issues');
    }
    
    // Remove duplicates
    return [...new Set(recommendations)];
  }
  
  // Simulate different load patterns
  static generateLoadPattern(pattern: LoadPattern['pattern'], baseRPS: number, duration: number): number[] {
    const points = Math.min(duration, 300); // Max 300 data points
    const interval = duration / points;
    const timeline: number[] = [];
    
    for (let i = 0; i < points; i++) {
      const time = i * interval;
      let rps = baseRPS;
      
      switch (pattern) {
        case 'constant':
          rps = baseRPS;
          break;
          
        case 'spike':
          if (time > duration * 0.3 && time < duration * 0.7) {
            rps = baseRPS * 3; // 3x spike in middle
          }
          break;
          
        case 'ramp':
          rps = baseRPS * (time / duration);
          break;
          
        case 'wave':
          rps = baseRPS * (1 + 0.5 * Math.sin(2 * Math.PI * time / (duration / 3)));
          break;
      }
      
      timeline.push(rps);
    }
    
    return timeline;
  }
} 