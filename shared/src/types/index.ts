import { z } from 'zod';

// ============================================================================
// CORE SYSTEM TYPES
// ============================================================================

// Deployment modes
export enum DeploymentMode {
  LIGHT = 'light',     // Browser-based simulation
  HEAVY = 'heavy',     // Cloud/Kubernetes simulation
  DEPLOYMENT = 'deployment' // Real infrastructure
}

// System architecture tiers
export const SystemModeSchema = z.enum(['light', 'heavy', 'deployment']);
export type SystemMode = z.infer<typeof SystemModeSchema>;

// ============================================================================
// COMPONENT SYSTEM
// ============================================================================

// Base component types
export enum ComponentType {
  // Infrastructure
  LOAD_BALANCER = 'load_balancer',
  API_GATEWAY = 'api_gateway',
  SERVICE_MESH = 'service_mesh',
  
  // Data Storage
  DATABASE = 'database',
  CACHE = 'cache',
  MESSAGE_QUEUE = 'message_queue',
  OBJECT_STORAGE = 'object_storage',
  
  // Compute Services
  MICROSERVICE = 'microservice',
  FUNCTION = 'function',
  CONTAINER = 'container',
  
  // ML Components
  MODEL_TRAINING = 'model_training',
  MODEL_SERVING = 'model_serving',
  FEATURE_STORE = 'feature_store',
  ML_PIPELINE = 'ml_pipeline',
  
  // Monitoring
  METRICS = 'metrics',
  LOGGING = 'logging',
  TRACING = 'tracing',
  ALERTING = 'alerting',
  
  // Custom
  CUSTOM_SERVICE = 'custom_service'
}

// Component configuration
export const ComponentConfigSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ComponentType),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  
  // Visual properties
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  
  // Component-specific configuration
  config: z.record(z.any()),
  
  // Resource requirements
  resources: z.object({
    cpu: z.string().optional(),
    memory: z.string().optional(),
    storage: z.string().optional(),
    replicas: z.number().optional().default(1)
  }).optional(),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string()).optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;

// ============================================================================
// CONNECTION SYSTEM
// ============================================================================

export enum ConnectionType {
  HTTP = 'http',
  GRPC = 'grpc',
  MESSAGE_QUEUE = 'message_queue',
  DATABASE = 'database',
  STREAM = 'stream',
  CUSTOM = 'custom'
}

export const ConnectionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.nativeEnum(ConnectionType),
  
  // Connection configuration
  config: z.object({
    protocol: z.string().optional(),
    port: z.number().optional(),
    path: z.string().optional(),
    timeout: z.number().optional(),
    retries: z.number().optional()
  }).optional(),
  
  // Performance characteristics
  performance: z.object({
    bandwidth: z.string().optional(),
    latency: z.string().optional(),
    throughput: z.string().optional()
  }).optional()
});

export type Connection = z.infer<typeof ConnectionSchema>;

// ============================================================================
// SYSTEM DESIGN
// ============================================================================

export const SystemDesignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  
  // System configuration
  mode: SystemModeSchema,
  components: z.array(ComponentConfigSchema),
  connections: z.array(ConnectionSchema),
  
  // Pattern information
  patterns: z.array(z.string()).default([]),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  author: z.string().optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export type SystemDesign = z.infer<typeof SystemDesignSchema>;

// ============================================================================
// PATTERN SYSTEM
// ============================================================================

export enum PatternCategory {
  // Distributed Systems
  SINGLE_NODE = 'single_node',
  SERVING = 'serving',
  BATCH_COMPUTATIONAL = 'batch_computational',
  EVENT_DRIVEN = 'event_driven',
  MULTI_NODE = 'multi_node',
  
  // ML Patterns
  DATA_REPRESENTATION = 'data_representation',
  PROBLEM_REPRESENTATION = 'problem_representation',
  MODEL_TRAINING = 'model_training',
  MODEL_SERVING_PATTERN = 'model_serving_pattern',
  WORKFLOW = 'workflow',
  
  // Microservices
  DECOMPOSITION = 'decomposition',
  DATA_MANAGEMENT = 'data_management',
  COMMUNICATION = 'communication',
  RELIABILITY = 'reliability',
  OBSERVABILITY = 'observability',
  DEPLOYMENT = 'deployment'
}

export const PatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(PatternCategory),
  
  // Pattern definition
  components: z.array(ComponentConfigSchema),
  connections: z.array(ConnectionSchema),
  
  // Template information
  template: z.object({
    variables: z.record(z.any()).optional(),
    customization: z.record(z.any()).optional()
  }),
  
  // Documentation
  documentation: z.object({
    overview: z.string(),
    useCases: z.array(z.string()),
    benefits: z.array(z.string()),
    tradeoffs: z.array(z.string()).optional(),
    examples: z.array(z.object({
      name: z.string(),
      description: z.string(),
      config: z.record(z.any())
    })).optional()
  }),
  
  // Performance characteristics
  performance: z.object({
    latency: z.string().optional(),
    throughput: z.string().optional(),
    scalability: z.string().optional(),
    availability: z.string().optional()
  }).optional(),
  
  // Implementation details
  implementation: z.object({
    complexity: z.enum(['low', 'medium', 'high']),
    estimatedTime: z.string(),
    prerequisites: z.array(z.string()).default([])
  })
});

export type Pattern = z.infer<typeof PatternSchema>;

// ============================================================================
// SERVICE BUILDER TYPES
// ============================================================================

export enum FrameworkType {
  // Web Frameworks
  SPRING_BOOT = 'spring_boot',
  DJANGO = 'django',
  EXPRESS = 'express',
  FASTAPI = 'fastapi',
  FLASK = 'flask',
  LARAVEL = 'laravel',
  
  // ML Frameworks
  PYTORCH = 'pytorch',
  TENSORFLOW = 'tensorflow',
  SCIKIT_LEARN = 'scikit_learn',
  XGBOOST = 'xgboost',
  
  // Data Processing
  APACHE_SPARK = 'apache_spark',
  APACHE_FLINK = 'apache_flink',
  APACHE_KAFKA = 'apache_kafka'
}

export const ServiceBuilderConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  framework: z.nativeEnum(FrameworkType),
  
  // API Configuration
  endpoints: z.array(z.object({
    path: z.string(),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    description: z.string().optional(),
    requestSchema: z.record(z.any()).optional(),
    responseSchema: z.record(z.any()).optional(),
    authentication: z.boolean().default(false)
  })).default([]),
  
  // Database Configuration
  database: z.object({
    type: z.enum(['postgresql', 'mysql', 'mongodb', 'sqlite']).optional(),
    models: z.array(z.object({
      name: z.string(),
      fields: z.record(z.any())
    })).default([])
  }).optional(),
  
  // Generated artifacts
  generatedCode: z.record(z.string()).optional(),
  dockerConfig: z.string().optional(),
  kubernetesConfig: z.string().optional()
});

export type ServiceBuilderConfig = z.infer<typeof ServiceBuilderConfigSchema>;

// ============================================================================
// ML BUILDER TYPES
// ============================================================================

export enum MLTaskType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  NLP = 'nlp',
  COMPUTER_VISION = 'computer_vision',
  RECOMMENDATION = 'recommendation',
  TIME_SERIES = 'time_series'
}

export const MLModelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  taskType: z.nativeEnum(MLTaskType),
  framework: z.nativeEnum(FrameworkType),
  
  // Model architecture
  architecture: z.object({
    type: z.string(),
    layers: z.array(z.object({
      type: z.string(),
      config: z.record(z.any())
    })).optional(),
    parameters: z.record(z.any()).optional()
  }),
  
  // Training configuration
  training: z.object({
    dataSource: z.string().optional(),
    batchSize: z.number().default(32),
    epochs: z.number().default(10),
    learningRate: z.number().default(0.001),
    optimizer: z.string().default('adam'),
    lossFunction: z.string().optional(),
    metrics: z.array(z.string()).default(['accuracy'])
  }),
  
  // Serving configuration  
  serving: z.object({
    endpoint: z.string().optional(),
    batchSize: z.number().default(1),
    timeout: z.number().default(30),
    scalingConfig: z.record(z.any()).optional()
  }).optional(),
  
  // Generated artifacts
  generatedCode: z.record(z.string()).optional(),
  trainingScript: z.string().optional(),
  servingScript: z.string().optional()
});

export type MLModelConfig = z.infer<typeof MLModelConfigSchema>;

// ============================================================================
// SIMULATION TYPES
// ============================================================================

export const SimulationConfigSchema = z.object({
  id: z.string(),
  systemId: z.string(),
  
  // Simulation parameters
  duration: z.number().default(60), // seconds
  users: z.number().default(100),
  requestsPerSecond: z.number().default(10),
  
  // Traffic patterns
  trafficPattern: z.enum(['constant', 'spike', 'gradual', 'random']).default('constant'),
  
  // Failure scenarios
  failureScenarios: z.array(z.object({
    componentId: z.string(),
    failureType: z.enum(['crash', 'slow', 'network', 'resource']),
    probability: z.number().min(0).max(1),
    duration: z.number().optional()
  })).default([])
});

export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;

export const SimulationResultSchema = z.object({
  id: z.string(),
  configId: z.string(),
  
  // Performance metrics
  metrics: z.object({
    totalRequests: z.number(),
    successfulRequests: z.number(),
    failedRequests: z.number(),
    averageLatency: z.number(),
    p95Latency: z.number(),
    p99Latency: z.number(),
    throughput: z.number(),
    errorRate: z.number()
  }),
  
  // Component-specific metrics
  componentMetrics: z.record(z.object({
    cpu: z.number(),
    memory: z.number(),
    network: z.number(),
    latency: z.number(),
    throughput: z.number()
  })),
  
  // Resource utilization
  resourceUtilization: z.object({
    totalCPU: z.number(),
    totalMemory: z.number(),
    totalStorage: z.number(),
    estimatedCost: z.number().optional()
  }),
  
  // Bottlenecks and recommendations
  bottlenecks: z.array(z.object({
    componentId: z.string(),
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string(),
    recommendation: z.string()
  })).default([]),
  
  // Execution details
  executedAt: z.date().default(() => new Date()),
  duration: z.number()
});

export type SimulationResult = z.infer<typeof SimulationResultSchema>;

// ============================================================================
// DEPLOYMENT TYPES
// ============================================================================

export enum DeploymentTarget {
  KUBERNETES = 'kubernetes',
  DOCKER_COMPOSE = 'docker_compose',
  AWS_ECS = 'aws_ecs',
  AWS_EKS = 'aws_eks',
  GCP_GKE = 'gcp_gke',
  AZURE_AKS = 'azure_aks'
}

export const DeploymentConfigSchema = z.object({
  id: z.string(),
  systemId: z.string(),
  target: z.nativeEnum(DeploymentTarget),
  
  // Target-specific configuration
  config: z.record(z.any()),
  
  // Generated manifests
  manifests: z.record(z.string()).optional(),
  
  // Deployment status
  status: z.enum(['pending', 'deploying', 'deployed', 'failed']).default('pending'),
  deployedAt: z.date().optional(),
  
  // Environment configuration
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Secrets and configuration
  secrets: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).default([]),
  
  configMaps: z.array(z.object({
    name: z.string(),
    data: z.record(z.string())
  })).default([])
});

export type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.date().default(() => new Date())
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
};

// ============================================================================
// VALIDATION SCHEMAS EXPORT
// ============================================================================

export const schemas = {
  SystemMode: SystemModeSchema,
  ComponentConfig: ComponentConfigSchema,
  Connection: ConnectionSchema,
  SystemDesign: SystemDesignSchema,
  Pattern: PatternSchema,
  ServiceBuilderConfig: ServiceBuilderConfigSchema,
  MLModelConfig: MLModelConfigSchema,
  SimulationConfig: SimulationConfigSchema,
  SimulationResult: SimulationResultSchema,
  DeploymentConfig: DeploymentConfigSchema,
  ApiResponse: ApiResponseSchema
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ID = string;
export type Timestamp = Date;

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ScaleSimError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ScaleSimError';
  }
}

export class ValidationError extends ScaleSimError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ScaleSimError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends ScaleSimError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
} 