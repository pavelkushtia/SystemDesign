import { z } from 'zod';

// ============================================================================
// BASIC ENUMS AND CONSTANTS
// ============================================================================

export enum SystemMode {
  LIGHT = 'light',
  HEAVY = 'heavy', 
  DEPLOYMENT = 'deployment'
}

export enum ComponentType {
  API_GATEWAY = 'api-gateway',
  LOAD_BALANCER = 'load-balancer',
  MICROSERVICE = 'microservice',
  DATABASE = 'database',
  CACHE = 'cache',
  MESSAGE_QUEUE = 'message-queue',
  ML_MODEL = 'ml-model',
  CDN = 'cdn'
}

export enum PatternCategory {
  DISTRIBUTED_SYSTEMS = 'distributed-systems',
  MICROSERVICES = 'microservices', 
  ML_AI = 'ml-ai',
  DATA_PROCESSING = 'data-processing',
  SECURITY = 'security',
  MONITORING = 'monitoring'
}

export enum FrameworkType {
  SPRING_BOOT = 'spring-boot',
  DJANGO = 'django',
  EXPRESS = 'express',
  FASTAPI = 'fastapi',
  FLASK = 'flask',
  LARAVEL = 'laravel',
  PYTORCH = 'pytorch',
  TENSORFLOW = 'tensorflow',
  SCIKIT_LEARN = 'scikit-learn'
}

export enum DeploymentTarget {
  KUBERNETES = 'kubernetes',
  DOCKER_COMPOSE = 'docker-compose',
  TERRAFORM = 'terraform',
  AWS_ECS = 'aws-ecs',
  GCP_GKE = 'gcp-gke',
  AZURE_AKS = 'azure-aks'
}

// ============================================================================
// USER AUTHENTICATION & MANAGEMENT
// ============================================================================

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password_hash: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  email_verified: z.boolean().default(false),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

export const OAuthProviderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  provider: z.enum(['google', 'github', 'linkedin', 'facebook']),
  provider_id: z.string(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  expires_at: z.date().optional(),
  created_at: z.date().default(() => new Date())
});

export const UserPreferencesSchema = z.object({
  user_id: z.string(),
  theme: z.enum(['light', 'dark']).default('light'),
  notifications: z.boolean().default(true),
  public_profile: z.boolean().default(false),
  default_project_visibility: z.enum(['private', 'public', 'unlisted']).default('private'),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

export const UserSessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  refresh_token: z.string(),
  expires_at: z.date(),
  created_at: z.date().default(() => new Date())
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember_me: z.boolean().optional()
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  expires_in: z.number().optional(),
  message: z.string().optional()
});

export const ProjectCollaboratorSchema = z.object({
  id: z.string(),
  system_id: z.string(),
  user_id: z.string(),
  role: z.enum(['owner', 'admin', 'collaborator', 'viewer']).default('collaborator'),
  permissions: z.record(z.boolean()).optional(),
  invited_by: z.string().optional(),
  joined_at: z.date().default(() => new Date())
});

export const ProjectMetadataSchema = z.object({
  system_id: z.string(),
  readme_content: z.string().optional(),
  documentation: z.string().optional(),
  changelog: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  license: z.string().default('MIT'),
  repository_url: z.string().url().optional(),
  demo_url: z.string().url().optional(),
  screenshots: z.array(z.string().url()).default([]),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
});

export const ProjectStarSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  system_id: z.string(),
  created_at: z.date().default(() => new Date())
});

export const UserActivitySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  activity_type: z.enum(['create', 'update', 'simulate', 'deploy', 'fork', 'star', 'delete']),
  resource_type: z.enum(['system', 'pattern', 'simulation', 'deployment', 'service', 'ml_model']),
  resource_id: z.string(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date().default(() => new Date())
});

// ============================================================================
// COMPONENT CONFIGURATION
// ============================================================================

export const ComponentSpecsSchema = z.object({
  cpu: z.number().min(0).default(1),
  memory: z.number().min(0).default(1),
  storage: z.number().min(0).default(10),
  network: z.number().min(0).default(100)
});

export const ComponentScalingSchema = z.object({
  min: z.number().min(1).default(1),
  max: z.number().min(1).default(10),
  auto: z.boolean().default(false)
});

export const ComponentConfigSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ComponentType),
  name: z.string(),
  specs: ComponentSpecsSchema,
  scaling: ComponentScalingSchema,
  connections: z.array(z.string()).default([])
});

export const ConnectionSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().default('default'),
  properties: z.record(z.any()).default({})
});

export const SystemModeSchema = z.nativeEnum(SystemMode);

// ============================================================================
// SYSTEM DESIGN (UPDATED WITH USER CONTEXT)
// ============================================================================

export const SystemDesignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  
  // User ownership and visibility
  user_id: z.string().optional(),
  visibility: z.enum(['private', 'public', 'unlisted']).default('private'),
  fork_count: z.number().default(0),
  star_count: z.number().default(0),
  original_system_id: z.string().optional(),
  
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

// ============================================================================
// PATTERN DEFINITION
// ============================================================================

export const PatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(PatternCategory),
  
  // Pattern structure
  components: z.array(ComponentConfigSchema),
  connections: z.array(ConnectionSchema),
  
  // Pattern metadata
  template: z.record(z.any()).default({}),
  documentation: z.object({
    overview: z.string(),
    useCases: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    tradeoffs: z.array(z.string()).default([]),
    implementation: z.string().optional()
  }),
  
  // Performance characteristics
  performance: z.object({
    complexity: z.enum(['low', 'medium', 'high']).default('medium'),
    scalability: z.enum(['low', 'medium', 'high']).default('medium'),
    reliability: z.enum(['low', 'medium', 'high']).default('medium'),
    cost: z.enum(['low', 'medium', 'high']).default('medium')
  }).optional(),
  
  // Implementation details
  implementation: z.object({
    frameworks: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    estimatedTime: z.string().optional(),
    complexity: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate')
  }),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// ============================================================================
// SERVICE BUILDER CONFIGURATION (UPDATED WITH USER CONTEXT)
// ============================================================================

export const ServiceBuilderConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  framework: z.nativeEnum(FrameworkType),
  user_id: z.string().optional(),
  
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
  kubernetesConfig: z.string().optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// ============================================================================
// ML MODEL BUILDER CONFIGURATION (UPDATED WITH USER CONTEXT)
// ============================================================================

export const MLModelConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  taskType: z.enum(['classification', 'regression', 'clustering', 'recommendation', 'nlp', 'computer_vision']),
  framework: z.enum(['pytorch', 'tensorflow', 'scikit-learn']),
  user_id: z.string().optional(),
  
  // Model architecture
  architecture: z.object({
    layers: z.array(z.object({
      type: z.string(),
      config: z.record(z.any()).optional()
    })).default([]),
    optimizer: z.string().optional(),
    loss: z.string().optional(),
    metrics: z.array(z.string()).default([])
  }),
  
  // Training configuration
  training: z.object({
    epochs: z.number().default(10),
    batchSize: z.number().default(32),
    learningRate: z.number().default(0.001),
    validationSplit: z.number().default(0.2)
  }),
  
  // Serving configuration
  serving: z.object({
    endpoint: z.string().optional(),
    batchPrediction: z.boolean().default(false),
    realTimeInference: z.boolean().default(true)
  }).optional(),
  
  // Generated artifacts
  generatedCode: z.record(z.string()).optional(),
  trainingScript: z.string().optional(),
  servingScript: z.string().optional(),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// ============================================================================
// SIMULATION CONFIGURATION (UPDATED WITH USER CONTEXT)
// ============================================================================

export const LoadPatternSchema = z.object({
  users: z.number().min(1).default(100),
  duration: z.number().min(10).default(300),
  rampUp: z.number().min(0).default(30),
  requestsPerSecond: z.number().min(1).default(10),
  pattern: z.enum(['constant', 'spike', 'ramp', 'wave']).default('constant')
});

export const SimulationConfigSchema = z.object({
  id: z.string(),
  systemId: z.string(),
  user_id: z.string().optional(),
  duration: z.number().default(60),
  users: z.number().default(100),
  requestsPerSecond: z.number().default(10),
  trafficPattern: z.enum(['constant', 'spike', 'ramp', 'wave']).default('constant'),
  failureScenarios: z.array(z.object({
    componentId: z.string(),
    failureType: z.string(),
    probability: z.number().min(0).max(1)
  })).default([]),
  createdAt: z.date().default(() => new Date())
});

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

// ============================================================================
// DEPLOYMENT CONFIGURATION (UPDATED WITH USER CONTEXT)
// ============================================================================

export const DeploymentConfigSchema = z.object({
  id: z.string(),
  systemId: z.string(),
  user_id: z.string().optional(),
  target: z.nativeEnum(DeploymentTarget),
  
  // Configuration
  config: z.record(z.any()).default({}),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Generated manifests
  manifests: z.record(z.string()).optional(),
  
  // Deployment status
  status: z.enum(['pending', 'deploying', 'deployed', 'failed']).default('pending'),
  deployedAt: z.date().optional(),
  
  // Security configuration
  secrets: z.array(z.object({
    name: z.string(),
    value: z.string()
  })).default([]),
  
  configMaps: z.array(z.object({
    name: z.string(),
    data: z.record(z.string())
  })).default([]),
  
  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date().default(() => new Date())
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type OAuthProvider = z.infer<typeof OAuthProviderSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserSession = z.infer<typeof UserSessionSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type ProjectCollaborator = z.infer<typeof ProjectCollaboratorSchema>;
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type ProjectStar = z.infer<typeof ProjectStarSchema>;
export type UserActivity = z.infer<typeof UserActivitySchema>;

export type ComponentSpecs = z.infer<typeof ComponentSpecsSchema>;
export type ComponentScaling = z.infer<typeof ComponentScalingSchema>;
export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;
export type Connection = z.infer<typeof ConnectionSchema>;
export type SystemDesign = z.infer<typeof SystemDesignSchema>;
export type Pattern = z.infer<typeof PatternSchema>;
export type ServiceBuilderConfig = z.infer<typeof ServiceBuilderConfigSchema>;
export type MLModelConfig = z.infer<typeof MLModelConfigSchema>;
export type LoadPattern = z.infer<typeof LoadPatternSchema>;
export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class ValidationError extends Error {
  constructor(message: string, public errors: z.ZodIssue[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
} 