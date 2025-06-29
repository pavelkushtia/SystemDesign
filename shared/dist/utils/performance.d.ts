/**
 * Performance calculation utilities for system simulation
 */
export interface ResourceMetrics {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
}
export interface PerformanceMetrics {
    latency: number;
    throughput: number;
    errorRate: number;
    availability: number;
}
/**
 * Calculate estimated latency based on component type and configuration
 */
export declare function calculateLatency(componentType: string, config: Record<string, any>): number;
/**
 * Calculate estimated throughput based on component type and resources
 */
export declare function calculateThroughput(componentType: string, config: Record<string, any>): number;
/**
 * Calculate resource requirements based on expected load
 */
export declare function calculateResourceRequirements(componentType: string, expectedRPS: number, _config?: Record<string, any>): ResourceMetrics;
/**
 * Calculate estimated cost based on resource usage
 */
export declare function calculateEstimatedCost(resources: ResourceMetrics, _region?: string, provider?: string): number;
/**
 * Calculate system-wide performance metrics
 */
export declare function calculateSystemPerformance(components: Array<{
    type: string;
    config: Record<string, any>;
}>, connections: Array<{
    sourceId: string;
    targetId: string;
    type: string;
}>): PerformanceMetrics;
/**
 * Generate performance recommendations
 */
export declare function generatePerformanceRecommendations(metrics: PerformanceMetrics, components: Array<{
    id: string;
    type: string;
    config: Record<string, any>;
}>): Array<{
    type: string;
    component: string;
    recommendation: string;
    impact: string;
}>;
/**
 * Format metrics for display
 */
export declare function formatMetrics(metrics: PerformanceMetrics): Record<string, string>;
/**
 * Format resource requirements for display
 */
export declare function formatResources(resources: ResourceMetrics): Record<string, string>;
//# sourceMappingURL=performance.d.ts.map