/**
 * Performance calculation utilities for system simulation
 */
/**
 * Calculate estimated latency based on component type and configuration
 */
export function calculateLatency(componentType, config) {
    const baseLatencies = {
        database: 5, // 5ms base
        cache: 1, // 1ms base
        microservice: 10, // 10ms base
        api_gateway: 2, // 2ms base
        load_balancer: 1, // 1ms base
        message_queue: 3, // 3ms base
        model_serving: 50, // 50ms base for ML inference
        model_training: 1000, // 1s base for training step
    };
    let baseLatency = baseLatencies[componentType] || 10;
    // Adjust based on configuration
    if (config.complexity === 'high') {
        baseLatency *= 2;
    }
    else if (config.complexity === 'low') {
        baseLatency *= 0.5;
    }
    // Adjust based on resource allocation
    if (config.resources?.cpu) {
        const cpuCores = parseFloat(config.resources.cpu);
        if (cpuCores > 2) {
            baseLatency *= 0.8; // Better performance with more CPU
        }
        else if (cpuCores < 1) {
            baseLatency *= 1.5; // Worse performance with less CPU
        }
    }
    return Math.round(baseLatency * 100) / 100; // Round to 2 decimal places
}
/**
 * Calculate estimated throughput based on component type and resources
 */
export function calculateThroughput(componentType, config) {
    const baseThroughputs = {
        database: 1000, // 1000 RPS base
        cache: 10000, // 10000 RPS base
        microservice: 500, // 500 RPS base
        api_gateway: 5000, // 5000 RPS base
        load_balancer: 10000, // 10000 RPS base
        message_queue: 2000, // 2000 messages/sec
        model_serving: 100, // 100 inferences/sec
        model_training: 1, // 1 batch/sec
    };
    let baseThroughput = baseThroughputs[componentType] || 500;
    // Adjust based on resource allocation
    if (config.resources?.cpu) {
        const cpuCores = parseFloat(config.resources.cpu);
        baseThroughput *= Math.max(0.5, cpuCores); // Scale with CPU cores
    }
    if (config.resources?.replicas) {
        baseThroughput *= config.resources.replicas; // Scale with replicas
    }
    return Math.round(baseThroughput);
}
/**
 * Calculate resource requirements based on expected load
 */
export function calculateResourceRequirements(componentType, expectedRPS, _config = {}) {
    const baseResources = {
        database: { cpu: 2, memory: 4096, storage: 100, network: 100 },
        cache: { cpu: 1, memory: 2048, storage: 10, network: 100 },
        microservice: { cpu: 1, memory: 1024, storage: 5, network: 50 },
        api_gateway: { cpu: 2, memory: 2048, storage: 10, network: 200 },
        load_balancer: { cpu: 1, memory: 512, storage: 5, network: 500 },
        message_queue: { cpu: 2, memory: 2048, storage: 50, network: 100 },
        model_serving: { cpu: 4, memory: 8192, storage: 20, network: 100 },
        model_training: { cpu: 8, memory: 16384, storage: 100, network: 50 },
    };
    const base = baseResources[componentType] || baseResources.microservice;
    // Scale resources based on expected RPS
    const scaleFactor = Math.max(1, expectedRPS / 1000); // Scale factor per 1000 RPS
    return {
        cpu: Math.round((base.cpu * scaleFactor) * 100) / 100,
        memory: Math.round(base.memory * scaleFactor),
        storage: Math.round(base.storage * scaleFactor),
        network: Math.round(base.network * scaleFactor)
    };
}
/**
 * Calculate estimated cost based on resource usage
 */
export function calculateEstimatedCost(resources, _region = 'us-east-1', provider = 'aws') {
    // Simplified cost calculation (per hour)
    const pricing = {
        aws: {
            cpu: 0.05, // $0.05 per CPU core per hour
            memory: 0.01, // $0.01 per GB memory per hour
            storage: 0.001 // $0.001 per GB storage per hour
        },
        gcp: {
            cpu: 0.048,
            memory: 0.009,
            storage: 0.0009
        },
        azure: {
            cpu: 0.052,
            memory: 0.011,
            storage: 0.0011
        }
    };
    const rates = pricing[provider] || pricing.aws;
    const cpuCost = resources.cpu * rates.cpu;
    const memoryCost = (resources.memory / 1024) * rates.memory; // Convert MB to GB
    const storageCost = resources.storage * rates.storage;
    return Math.round((cpuCost + memoryCost + storageCost) * 100) / 100;
}
/**
 * Calculate system-wide performance metrics
 */
export function calculateSystemPerformance(components, connections) {
    // Calculate average latency across critical path
    const totalLatency = components.reduce((sum, component) => {
        return sum + calculateLatency(component.type, component.config);
    }, 0);
    // Calculate minimum throughput (bottleneck)
    const throughputs = components.map(component => calculateThroughput(component.type, component.config));
    const minThroughput = Math.min(...throughputs);
    // Estimate error rate based on component count and complexity
    const complexityScore = components.length + connections.length;
    const baseErrorRate = Math.min(5, complexityScore * 0.1); // Max 5% error rate
    // Estimate availability based on component availability
    const componentAvailability = 0.999; // 99.9% per component
    const systemAvailability = Math.pow(componentAvailability, components.length);
    return {
        latency: Math.round(totalLatency * 100) / 100,
        throughput: minThroughput,
        errorRate: Math.round(baseErrorRate * 100) / 100,
        availability: Math.round(systemAvailability * 10000) / 100 // Convert to percentage
    };
}
/**
 * Generate performance recommendations
 */
export function generatePerformanceRecommendations(metrics, components) {
    const recommendations = [];
    // High latency recommendations
    if (metrics.latency > 100) {
        recommendations.push({
            type: 'latency',
            component: 'system',
            recommendation: 'Consider adding caching layers or optimizing database queries',
            impact: 'Could reduce latency by 30-50%'
        });
    }
    // Low throughput recommendations
    if (metrics.throughput < 1000) {
        recommendations.push({
            type: 'throughput',
            component: 'system',
            recommendation: 'Add load balancing and horizontal scaling',
            impact: 'Could increase throughput by 2-5x'
        });
    }
    // High error rate recommendations
    if (metrics.errorRate > 1) {
        recommendations.push({
            type: 'reliability',
            component: 'system',
            recommendation: 'Implement circuit breakers and retry mechanisms',
            impact: 'Could reduce error rate by 60-80%'
        });
    }
    // Component-specific recommendations
    components.forEach(component => {
        if (component.type === 'database' && !component.config.caching) {
            recommendations.push({
                type: 'performance',
                component: component.id,
                recommendation: 'Add Redis cache layer for frequently accessed data',
                impact: 'Could reduce database load by 70%'
            });
        }
        if (component.type === 'microservice' && !component.config.resources?.replicas) {
            recommendations.push({
                type: 'availability',
                component: component.id,
                recommendation: 'Configure multiple replicas for high availability',
                impact: 'Improves availability from 99.9% to 99.99%'
            });
        }
    });
    return recommendations;
}
/**
 * Format metrics for display
 */
export function formatMetrics(metrics) {
    return {
        latency: `${metrics.latency}ms`,
        throughput: `${metrics.throughput.toLocaleString()} RPS`,
        errorRate: `${metrics.errorRate}%`,
        availability: `${metrics.availability}%`
    };
}
/**
 * Format resource requirements for display
 */
export function formatResources(resources) {
    return {
        cpu: `${resources.cpu} cores`,
        memory: `${(resources.memory / 1024).toFixed(1)} GB`,
        storage: `${resources.storage} GB`,
        network: `${resources.network} Mbps`
    };
}
