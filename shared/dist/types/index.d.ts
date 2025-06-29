import { z } from 'zod';
export declare enum DeploymentMode {
    LIGHT = "light",// Browser-based simulation
    HEAVY = "heavy",// Cloud/Kubernetes simulation
    DEPLOYMENT = "deployment"
}
export declare const SystemModeSchema: z.ZodEnum<["light", "heavy", "deployment"]>;
export type SystemMode = z.infer<typeof SystemModeSchema>;
export declare enum ComponentType {
    LOAD_BALANCER = "load_balancer",
    API_GATEWAY = "api_gateway",
    SERVICE_MESH = "service_mesh",
    DATABASE = "database",
    CACHE = "cache",
    MESSAGE_QUEUE = "message_queue",
    OBJECT_STORAGE = "object_storage",
    MICROSERVICE = "microservice",
    FUNCTION = "function",
    CONTAINER = "container",
    MODEL_TRAINING = "model_training",
    MODEL_SERVING = "model_serving",
    FEATURE_STORE = "feature_store",
    ML_PIPELINE = "ml_pipeline",
    METRICS = "metrics",
    LOGGING = "logging",
    TRACING = "tracing",
    ALERTING = "alerting",
    CUSTOM_SERVICE = "custom_service"
}
export declare const ComponentConfigSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodNativeEnum<typeof ComponentType>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    config: z.ZodRecord<z.ZodString, z.ZodAny>;
    resources: z.ZodOptional<z.ZodObject<{
        cpu: z.ZodOptional<z.ZodString>;
        memory: z.ZodOptional<z.ZodString>;
        storage: z.ZodOptional<z.ZodString>;
        replicas: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        replicas: number;
        cpu?: string | undefined;
        memory?: string | undefined;
        storage?: string | undefined;
    }, {
        cpu?: string | undefined;
        memory?: string | undefined;
        storage?: string | undefined;
        replicas?: number | undefined;
    }>>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    type: ComponentType;
    id: string;
    name: string;
    version: string;
    position: {
        x: number;
        y: number;
    };
    config: Record<string, any>;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    description?: string | undefined;
    resources?: {
        replicas: number;
        cpu?: string | undefined;
        memory?: string | undefined;
        storage?: string | undefined;
    } | undefined;
    metadata?: Record<string, string> | undefined;
}, {
    type: ComponentType;
    id: string;
    name: string;
    position: {
        x: number;
        y: number;
    };
    config: Record<string, any>;
    description?: string | undefined;
    version?: string | undefined;
    resources?: {
        cpu?: string | undefined;
        memory?: string | undefined;
        storage?: string | undefined;
        replicas?: number | undefined;
    } | undefined;
    tags?: string[] | undefined;
    metadata?: Record<string, string> | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}>;
export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;
export declare enum ConnectionType {
    HTTP = "http",
    GRPC = "grpc",
    MESSAGE_QUEUE = "message_queue",
    DATABASE = "database",
    STREAM = "stream",
    CUSTOM = "custom"
}
export declare const ConnectionSchema: z.ZodObject<{
    id: z.ZodString;
    sourceId: z.ZodString;
    targetId: z.ZodString;
    type: z.ZodNativeEnum<typeof ConnectionType>;
    config: z.ZodOptional<z.ZodObject<{
        protocol: z.ZodOptional<z.ZodString>;
        port: z.ZodOptional<z.ZodNumber>;
        path: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
        retries: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        path?: string | undefined;
        protocol?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
        retries?: number | undefined;
    }, {
        path?: string | undefined;
        protocol?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
        retries?: number | undefined;
    }>>;
    performance: z.ZodOptional<z.ZodObject<{
        bandwidth: z.ZodOptional<z.ZodString>;
        latency: z.ZodOptional<z.ZodString>;
        throughput: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        bandwidth?: string | undefined;
        latency?: string | undefined;
        throughput?: string | undefined;
    }, {
        bandwidth?: string | undefined;
        latency?: string | undefined;
        throughput?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: ConnectionType;
    id: string;
    sourceId: string;
    targetId: string;
    config?: {
        path?: string | undefined;
        protocol?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
        retries?: number | undefined;
    } | undefined;
    performance?: {
        bandwidth?: string | undefined;
        latency?: string | undefined;
        throughput?: string | undefined;
    } | undefined;
}, {
    type: ConnectionType;
    id: string;
    sourceId: string;
    targetId: string;
    config?: {
        path?: string | undefined;
        protocol?: string | undefined;
        port?: number | undefined;
        timeout?: number | undefined;
        retries?: number | undefined;
    } | undefined;
    performance?: {
        bandwidth?: string | undefined;
        latency?: string | undefined;
        throughput?: string | undefined;
    } | undefined;
}>;
export type Connection = z.infer<typeof ConnectionSchema>;
export declare const SystemDesignSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    mode: z.ZodEnum<["light", "heavy", "deployment"]>;
    components: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodNativeEnum<typeof ComponentType>;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        resources: z.ZodOptional<z.ZodObject<{
            cpu: z.ZodOptional<z.ZodString>;
            memory: z.ZodOptional<z.ZodString>;
            storage: z.ZodOptional<z.ZodString>;
            replicas: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        }, {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        }>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        type: ComponentType;
        id: string;
        name: string;
        version: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        resources?: {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        } | undefined;
        metadata?: Record<string, string> | undefined;
    }, {
        type: ComponentType;
        id: string;
        name: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        description?: string | undefined;
        version?: string | undefined;
        resources?: {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        } | undefined;
        tags?: string[] | undefined;
        metadata?: Record<string, string> | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }>, "many">;
    connections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceId: z.ZodString;
        targetId: z.ZodString;
        type: z.ZodNativeEnum<typeof ConnectionType>;
        config: z.ZodOptional<z.ZodObject<{
            protocol: z.ZodOptional<z.ZodString>;
            port: z.ZodOptional<z.ZodNumber>;
            path: z.ZodOptional<z.ZodString>;
            timeout: z.ZodOptional<z.ZodNumber>;
            retries: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        }, {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        }>>;
        performance: z.ZodOptional<z.ZodObject<{
            bandwidth: z.ZodOptional<z.ZodString>;
            latency: z.ZodOptional<z.ZodString>;
            throughput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        }, {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }, {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }>, "many">;
    patterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    author: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    version: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    mode: "light" | "heavy" | "deployment";
    components: {
        type: ComponentType;
        id: string;
        name: string;
        version: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        resources?: {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        } | undefined;
        metadata?: Record<string, string> | undefined;
    }[];
    connections: {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }[];
    patterns: string[];
    description?: string | undefined;
    author?: string | undefined;
}, {
    id: string;
    name: string;
    mode: "light" | "heavy" | "deployment";
    components: {
        type: ComponentType;
        id: string;
        name: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        description?: string | undefined;
        version?: string | undefined;
        resources?: {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        } | undefined;
        tags?: string[] | undefined;
        metadata?: Record<string, string> | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }[];
    connections: {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }[];
    description?: string | undefined;
    version?: string | undefined;
    tags?: string[] | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    patterns?: string[] | undefined;
    author?: string | undefined;
}>;
export type SystemDesign = z.infer<typeof SystemDesignSchema>;
export declare enum PatternCategory {
    SINGLE_NODE = "single_node",
    SERVING = "serving",
    BATCH_COMPUTATIONAL = "batch_computational",
    EVENT_DRIVEN = "event_driven",
    MULTI_NODE = "multi_node",
    DATA_REPRESENTATION = "data_representation",
    PROBLEM_REPRESENTATION = "problem_representation",
    MODEL_TRAINING = "model_training",
    MODEL_SERVING_PATTERN = "model_serving_pattern",
    WORKFLOW = "workflow",
    DECOMPOSITION = "decomposition",
    DATA_MANAGEMENT = "data_management",
    COMMUNICATION = "communication",
    RELIABILITY = "reliability",
    OBSERVABILITY = "observability",
    DEPLOYMENT = "deployment"
}
export declare const PatternSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodNativeEnum<typeof PatternCategory>;
    components: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodNativeEnum<typeof ComponentType>;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        resources: z.ZodOptional<z.ZodObject<{
            cpu: z.ZodOptional<z.ZodString>;
            memory: z.ZodOptional<z.ZodString>;
            storage: z.ZodOptional<z.ZodString>;
            replicas: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        }, {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        }>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        type: ComponentType;
        id: string;
        name: string;
        version: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        resources?: {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        } | undefined;
        metadata?: Record<string, string> | undefined;
    }, {
        type: ComponentType;
        id: string;
        name: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        description?: string | undefined;
        version?: string | undefined;
        resources?: {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        } | undefined;
        tags?: string[] | undefined;
        metadata?: Record<string, string> | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }>, "many">;
    connections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceId: z.ZodString;
        targetId: z.ZodString;
        type: z.ZodNativeEnum<typeof ConnectionType>;
        config: z.ZodOptional<z.ZodObject<{
            protocol: z.ZodOptional<z.ZodString>;
            port: z.ZodOptional<z.ZodNumber>;
            path: z.ZodOptional<z.ZodString>;
            timeout: z.ZodOptional<z.ZodNumber>;
            retries: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        }, {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        }>>;
        performance: z.ZodOptional<z.ZodObject<{
            bandwidth: z.ZodOptional<z.ZodString>;
            latency: z.ZodOptional<z.ZodString>;
            throughput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        }, {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }, {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }>, "many">;
    template: z.ZodObject<{
        variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        customization: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        variables?: Record<string, any> | undefined;
        customization?: Record<string, any> | undefined;
    }, {
        variables?: Record<string, any> | undefined;
        customization?: Record<string, any> | undefined;
    }>;
    documentation: z.ZodObject<{
        overview: z.ZodString;
        useCases: z.ZodArray<z.ZodString, "many">;
        benefits: z.ZodArray<z.ZodString, "many">;
        tradeoffs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            config: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            description: string;
            config: Record<string, any>;
        }, {
            name: string;
            description: string;
            config: Record<string, any>;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        overview: string;
        useCases: string[];
        benefits: string[];
        tradeoffs?: string[] | undefined;
        examples?: {
            name: string;
            description: string;
            config: Record<string, any>;
        }[] | undefined;
    }, {
        overview: string;
        useCases: string[];
        benefits: string[];
        tradeoffs?: string[] | undefined;
        examples?: {
            name: string;
            description: string;
            config: Record<string, any>;
        }[] | undefined;
    }>;
    performance: z.ZodOptional<z.ZodObject<{
        latency: z.ZodOptional<z.ZodString>;
        throughput: z.ZodOptional<z.ZodString>;
        scalability: z.ZodOptional<z.ZodString>;
        availability: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        latency?: string | undefined;
        throughput?: string | undefined;
        scalability?: string | undefined;
        availability?: string | undefined;
    }, {
        latency?: string | undefined;
        throughput?: string | undefined;
        scalability?: string | undefined;
        availability?: string | undefined;
    }>>;
    implementation: z.ZodObject<{
        complexity: z.ZodEnum<["low", "medium", "high"]>;
        estimatedTime: z.ZodString;
        prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        complexity: "low" | "medium" | "high";
        estimatedTime: string;
        prerequisites: string[];
    }, {
        complexity: "low" | "medium" | "high";
        estimatedTime: string;
        prerequisites?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    components: {
        type: ComponentType;
        id: string;
        name: string;
        version: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        resources?: {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        } | undefined;
        metadata?: Record<string, string> | undefined;
    }[];
    connections: {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }[];
    category: PatternCategory;
    template: {
        variables?: Record<string, any> | undefined;
        customization?: Record<string, any> | undefined;
    };
    documentation: {
        overview: string;
        useCases: string[];
        benefits: string[];
        tradeoffs?: string[] | undefined;
        examples?: {
            name: string;
            description: string;
            config: Record<string, any>;
        }[] | undefined;
    };
    implementation: {
        complexity: "low" | "medium" | "high";
        estimatedTime: string;
        prerequisites: string[];
    };
    performance?: {
        latency?: string | undefined;
        throughput?: string | undefined;
        scalability?: string | undefined;
        availability?: string | undefined;
    } | undefined;
}, {
    id: string;
    name: string;
    description: string;
    components: {
        type: ComponentType;
        id: string;
        name: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        description?: string | undefined;
        version?: string | undefined;
        resources?: {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        } | undefined;
        tags?: string[] | undefined;
        metadata?: Record<string, string> | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }[];
    connections: {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }[];
    category: PatternCategory;
    template: {
        variables?: Record<string, any> | undefined;
        customization?: Record<string, any> | undefined;
    };
    documentation: {
        overview: string;
        useCases: string[];
        benefits: string[];
        tradeoffs?: string[] | undefined;
        examples?: {
            name: string;
            description: string;
            config: Record<string, any>;
        }[] | undefined;
    };
    implementation: {
        complexity: "low" | "medium" | "high";
        estimatedTime: string;
        prerequisites?: string[] | undefined;
    };
    performance?: {
        latency?: string | undefined;
        throughput?: string | undefined;
        scalability?: string | undefined;
        availability?: string | undefined;
    } | undefined;
}>;
export type Pattern = z.infer<typeof PatternSchema>;
export declare enum FrameworkType {
    SPRING_BOOT = "spring_boot",
    DJANGO = "django",
    EXPRESS = "express",
    FASTAPI = "fastapi",
    FLASK = "flask",
    LARAVEL = "laravel",
    PYTORCH = "pytorch",
    TENSORFLOW = "tensorflow",
    SCIKIT_LEARN = "scikit_learn",
    XGBOOST = "xgboost",
    APACHE_SPARK = "apache_spark",
    APACHE_FLINK = "apache_flink",
    APACHE_KAFKA = "apache_kafka"
}
export declare const ServiceBuilderConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    framework: z.ZodNativeEnum<typeof FrameworkType>;
    endpoints: z.ZodDefault<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH"]>;
        description: z.ZodOptional<z.ZodString>;
        requestSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        responseSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        authentication: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
        authentication: boolean;
        description?: string | undefined;
        requestSchema?: Record<string, any> | undefined;
        responseSchema?: Record<string, any> | undefined;
    }, {
        path: string;
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
        description?: string | undefined;
        requestSchema?: Record<string, any> | undefined;
        responseSchema?: Record<string, any> | undefined;
        authentication?: boolean | undefined;
    }>, "many">>;
    database: z.ZodOptional<z.ZodObject<{
        type: z.ZodOptional<z.ZodEnum<["postgresql", "mysql", "mongodb", "sqlite"]>>;
        models: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            fields: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            fields: Record<string, any>;
        }, {
            name: string;
            fields: Record<string, any>;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        models: {
            name: string;
            fields: Record<string, any>;
        }[];
        type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
    }, {
        type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
        models?: {
            name: string;
            fields: Record<string, any>;
        }[] | undefined;
    }>>;
    generatedCode: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    dockerConfig: z.ZodOptional<z.ZodString>;
    kubernetesConfig: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    framework: FrameworkType;
    endpoints: {
        path: string;
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
        authentication: boolean;
        description?: string | undefined;
        requestSchema?: Record<string, any> | undefined;
        responseSchema?: Record<string, any> | undefined;
    }[];
    database?: {
        models: {
            name: string;
            fields: Record<string, any>;
        }[];
        type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
    } | undefined;
    generatedCode?: Record<string, string> | undefined;
    dockerConfig?: string | undefined;
    kubernetesConfig?: string | undefined;
}, {
    id: string;
    name: string;
    framework: FrameworkType;
    database?: {
        type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
        models?: {
            name: string;
            fields: Record<string, any>;
        }[] | undefined;
    } | undefined;
    endpoints?: {
        path: string;
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
        description?: string | undefined;
        requestSchema?: Record<string, any> | undefined;
        responseSchema?: Record<string, any> | undefined;
        authentication?: boolean | undefined;
    }[] | undefined;
    generatedCode?: Record<string, string> | undefined;
    dockerConfig?: string | undefined;
    kubernetesConfig?: string | undefined;
}>;
export type ServiceBuilderConfig = z.infer<typeof ServiceBuilderConfigSchema>;
export declare enum MLTaskType {
    CLASSIFICATION = "classification",
    REGRESSION = "regression",
    CLUSTERING = "clustering",
    NLP = "nlp",
    COMPUTER_VISION = "computer_vision",
    RECOMMENDATION = "recommendation",
    TIME_SERIES = "time_series"
}
export declare const MLModelConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    taskType: z.ZodNativeEnum<typeof MLTaskType>;
    framework: z.ZodNativeEnum<typeof FrameworkType>;
    architecture: z.ZodObject<{
        type: z.ZodString;
        layers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            config: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            config: Record<string, any>;
        }, {
            type: string;
            config: Record<string, any>;
        }>, "many">>;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: string;
        layers?: {
            type: string;
            config: Record<string, any>;
        }[] | undefined;
        parameters?: Record<string, any> | undefined;
    }, {
        type: string;
        layers?: {
            type: string;
            config: Record<string, any>;
        }[] | undefined;
        parameters?: Record<string, any> | undefined;
    }>;
    training: z.ZodObject<{
        dataSource: z.ZodOptional<z.ZodString>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        epochs: z.ZodDefault<z.ZodNumber>;
        learningRate: z.ZodDefault<z.ZodNumber>;
        optimizer: z.ZodDefault<z.ZodString>;
        lossFunction: z.ZodOptional<z.ZodString>;
        metrics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        metrics: string[];
        batchSize: number;
        epochs: number;
        learningRate: number;
        optimizer: string;
        dataSource?: string | undefined;
        lossFunction?: string | undefined;
    }, {
        metrics?: string[] | undefined;
        dataSource?: string | undefined;
        batchSize?: number | undefined;
        epochs?: number | undefined;
        learningRate?: number | undefined;
        optimizer?: string | undefined;
        lossFunction?: string | undefined;
    }>;
    serving: z.ZodOptional<z.ZodObject<{
        endpoint: z.ZodOptional<z.ZodString>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        timeout: z.ZodDefault<z.ZodNumber>;
        scalingConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        batchSize: number;
        endpoint?: string | undefined;
        scalingConfig?: Record<string, any> | undefined;
    }, {
        timeout?: number | undefined;
        batchSize?: number | undefined;
        endpoint?: string | undefined;
        scalingConfig?: Record<string, any> | undefined;
    }>>;
    generatedCode: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    trainingScript: z.ZodOptional<z.ZodString>;
    servingScript: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    framework: FrameworkType;
    taskType: MLTaskType;
    architecture: {
        type: string;
        layers?: {
            type: string;
            config: Record<string, any>;
        }[] | undefined;
        parameters?: Record<string, any> | undefined;
    };
    training: {
        metrics: string[];
        batchSize: number;
        epochs: number;
        learningRate: number;
        optimizer: string;
        dataSource?: string | undefined;
        lossFunction?: string | undefined;
    };
    serving?: {
        timeout: number;
        batchSize: number;
        endpoint?: string | undefined;
        scalingConfig?: Record<string, any> | undefined;
    } | undefined;
    generatedCode?: Record<string, string> | undefined;
    trainingScript?: string | undefined;
    servingScript?: string | undefined;
}, {
    id: string;
    name: string;
    framework: FrameworkType;
    taskType: MLTaskType;
    architecture: {
        type: string;
        layers?: {
            type: string;
            config: Record<string, any>;
        }[] | undefined;
        parameters?: Record<string, any> | undefined;
    };
    training: {
        metrics?: string[] | undefined;
        dataSource?: string | undefined;
        batchSize?: number | undefined;
        epochs?: number | undefined;
        learningRate?: number | undefined;
        optimizer?: string | undefined;
        lossFunction?: string | undefined;
    };
    serving?: {
        timeout?: number | undefined;
        batchSize?: number | undefined;
        endpoint?: string | undefined;
        scalingConfig?: Record<string, any> | undefined;
    } | undefined;
    generatedCode?: Record<string, string> | undefined;
    trainingScript?: string | undefined;
    servingScript?: string | undefined;
}>;
export type MLModelConfig = z.infer<typeof MLModelConfigSchema>;
export declare const SimulationConfigSchema: z.ZodObject<{
    id: z.ZodString;
    systemId: z.ZodString;
    duration: z.ZodDefault<z.ZodNumber>;
    users: z.ZodDefault<z.ZodNumber>;
    requestsPerSecond: z.ZodDefault<z.ZodNumber>;
    trafficPattern: z.ZodDefault<z.ZodEnum<["constant", "spike", "gradual", "random"]>>;
    failureScenarios: z.ZodDefault<z.ZodArray<z.ZodObject<{
        componentId: z.ZodString;
        failureType: z.ZodEnum<["crash", "slow", "network", "resource"]>;
        probability: z.ZodNumber;
        duration: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        componentId: string;
        failureType: "crash" | "slow" | "network" | "resource";
        probability: number;
        duration?: number | undefined;
    }, {
        componentId: string;
        failureType: "crash" | "slow" | "network" | "resource";
        probability: number;
        duration?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    systemId: string;
    duration: number;
    users: number;
    requestsPerSecond: number;
    trafficPattern: "constant" | "spike" | "gradual" | "random";
    failureScenarios: {
        componentId: string;
        failureType: "crash" | "slow" | "network" | "resource";
        probability: number;
        duration?: number | undefined;
    }[];
}, {
    id: string;
    systemId: string;
    duration?: number | undefined;
    users?: number | undefined;
    requestsPerSecond?: number | undefined;
    trafficPattern?: "constant" | "spike" | "gradual" | "random" | undefined;
    failureScenarios?: {
        componentId: string;
        failureType: "crash" | "slow" | "network" | "resource";
        probability: number;
        duration?: number | undefined;
    }[] | undefined;
}>;
export type SimulationConfig = z.infer<typeof SimulationConfigSchema>;
export declare const SimulationResultSchema: z.ZodObject<{
    id: z.ZodString;
    configId: z.ZodString;
    metrics: z.ZodObject<{
        totalRequests: z.ZodNumber;
        successfulRequests: z.ZodNumber;
        failedRequests: z.ZodNumber;
        averageLatency: z.ZodNumber;
        p95Latency: z.ZodNumber;
        p99Latency: z.ZodNumber;
        throughput: z.ZodNumber;
        errorRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        throughput: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        errorRate: number;
    }, {
        throughput: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        errorRate: number;
    }>;
    componentMetrics: z.ZodRecord<z.ZodString, z.ZodObject<{
        cpu: z.ZodNumber;
        memory: z.ZodNumber;
        network: z.ZodNumber;
        latency: z.ZodNumber;
        throughput: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        cpu: number;
        memory: number;
        latency: number;
        throughput: number;
        network: number;
    }, {
        cpu: number;
        memory: number;
        latency: number;
        throughput: number;
        network: number;
    }>>;
    resourceUtilization: z.ZodObject<{
        totalCPU: z.ZodNumber;
        totalMemory: z.ZodNumber;
        totalStorage: z.ZodNumber;
        estimatedCost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        totalCPU: number;
        totalMemory: number;
        totalStorage: number;
        estimatedCost?: number | undefined;
    }, {
        totalCPU: number;
        totalMemory: number;
        totalStorage: number;
        estimatedCost?: number | undefined;
    }>;
    bottlenecks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        componentId: z.ZodString;
        type: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high"]>;
        description: z.ZodString;
        recommendation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        description: string;
        recommendation: string;
        componentId: string;
        severity: "low" | "medium" | "high";
    }, {
        type: string;
        description: string;
        recommendation: string;
        componentId: string;
        severity: "low" | "medium" | "high";
    }>, "many">>;
    executedAt: z.ZodDefault<z.ZodDate>;
    duration: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    metrics: {
        throughput: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        errorRate: number;
    };
    id: string;
    duration: number;
    configId: string;
    componentMetrics: Record<string, {
        cpu: number;
        memory: number;
        latency: number;
        throughput: number;
        network: number;
    }>;
    resourceUtilization: {
        totalCPU: number;
        totalMemory: number;
        totalStorage: number;
        estimatedCost?: number | undefined;
    };
    bottlenecks: {
        type: string;
        description: string;
        recommendation: string;
        componentId: string;
        severity: "low" | "medium" | "high";
    }[];
    executedAt: Date;
}, {
    metrics: {
        throughput: number;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        errorRate: number;
    };
    id: string;
    duration: number;
    configId: string;
    componentMetrics: Record<string, {
        cpu: number;
        memory: number;
        latency: number;
        throughput: number;
        network: number;
    }>;
    resourceUtilization: {
        totalCPU: number;
        totalMemory: number;
        totalStorage: number;
        estimatedCost?: number | undefined;
    };
    bottlenecks?: {
        type: string;
        description: string;
        recommendation: string;
        componentId: string;
        severity: "low" | "medium" | "high";
    }[] | undefined;
    executedAt?: Date | undefined;
}>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export declare enum DeploymentTarget {
    KUBERNETES = "kubernetes",
    DOCKER_COMPOSE = "docker_compose",
    AWS_ECS = "aws_ecs",
    AWS_EKS = "aws_eks",
    GCP_GKE = "gcp_gke",
    AZURE_AKS = "azure_aks"
}
export declare const DeploymentConfigSchema: z.ZodObject<{
    id: z.ZodString;
    systemId: z.ZodString;
    target: z.ZodNativeEnum<typeof DeploymentTarget>;
    config: z.ZodRecord<z.ZodString, z.ZodAny>;
    manifests: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    status: z.ZodDefault<z.ZodEnum<["pending", "deploying", "deployed", "failed"]>>;
    deployedAt: z.ZodOptional<z.ZodDate>;
    environment: z.ZodDefault<z.ZodEnum<["development", "staging", "production"]>>;
    secrets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">>;
    configMaps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        data: Record<string, string>;
    }, {
        name: string;
        data: Record<string, string>;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "deploying" | "deployed" | "failed";
    id: string;
    config: Record<string, any>;
    systemId: string;
    target: DeploymentTarget;
    environment: "development" | "staging" | "production";
    secrets: {
        value: string;
        name: string;
    }[];
    configMaps: {
        name: string;
        data: Record<string, string>;
    }[];
    manifests?: Record<string, string> | undefined;
    deployedAt?: Date | undefined;
}, {
    id: string;
    config: Record<string, any>;
    systemId: string;
    target: DeploymentTarget;
    status?: "pending" | "deploying" | "deployed" | "failed" | undefined;
    manifests?: Record<string, string> | undefined;
    deployedAt?: Date | undefined;
    environment?: "development" | "staging" | "production" | undefined;
    secrets?: {
        value: string;
        name: string;
    }[] | undefined;
    configMaps?: {
        name: string;
        data: Record<string, string>;
    }[] | undefined;
}>;
export type DeploymentConfig = z.infer<typeof DeploymentConfigSchema>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    timestamp: Date;
    data?: any;
    error?: string | undefined;
}, {
    success: boolean;
    data?: any;
    error?: string | undefined;
    timestamp?: Date | undefined;
}>;
export type ApiResponse<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: Date;
};
export declare const schemas: {
    SystemMode: z.ZodEnum<["light", "heavy", "deployment"]>;
    ComponentConfig: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodNativeEnum<typeof ComponentType>;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        resources: z.ZodOptional<z.ZodObject<{
            cpu: z.ZodOptional<z.ZodString>;
            memory: z.ZodOptional<z.ZodString>;
            storage: z.ZodOptional<z.ZodString>;
            replicas: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        }, {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        }>>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        type: ComponentType;
        id: string;
        name: string;
        version: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        description?: string | undefined;
        resources?: {
            replicas: number;
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
        } | undefined;
        metadata?: Record<string, string> | undefined;
    }, {
        type: ComponentType;
        id: string;
        name: string;
        position: {
            x: number;
            y: number;
        };
        config: Record<string, any>;
        description?: string | undefined;
        version?: string | undefined;
        resources?: {
            cpu?: string | undefined;
            memory?: string | undefined;
            storage?: string | undefined;
            replicas?: number | undefined;
        } | undefined;
        tags?: string[] | undefined;
        metadata?: Record<string, string> | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
    }>;
    Connection: z.ZodObject<{
        id: z.ZodString;
        sourceId: z.ZodString;
        targetId: z.ZodString;
        type: z.ZodNativeEnum<typeof ConnectionType>;
        config: z.ZodOptional<z.ZodObject<{
            protocol: z.ZodOptional<z.ZodString>;
            port: z.ZodOptional<z.ZodNumber>;
            path: z.ZodOptional<z.ZodString>;
            timeout: z.ZodOptional<z.ZodNumber>;
            retries: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        }, {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        }>>;
        performance: z.ZodOptional<z.ZodObject<{
            bandwidth: z.ZodOptional<z.ZodString>;
            latency: z.ZodOptional<z.ZodString>;
            throughput: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        }, {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }, {
        type: ConnectionType;
        id: string;
        sourceId: string;
        targetId: string;
        config?: {
            path?: string | undefined;
            protocol?: string | undefined;
            port?: number | undefined;
            timeout?: number | undefined;
            retries?: number | undefined;
        } | undefined;
        performance?: {
            bandwidth?: string | undefined;
            latency?: string | undefined;
            throughput?: string | undefined;
        } | undefined;
    }>;
    SystemDesign: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
        mode: z.ZodEnum<["light", "heavy", "deployment"]>;
        components: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodNativeEnum<typeof ComponentType>;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            version: z.ZodDefault<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            config: z.ZodRecord<z.ZodString, z.ZodAny>;
            resources: z.ZodOptional<z.ZodObject<{
                cpu: z.ZodOptional<z.ZodString>;
                memory: z.ZodOptional<z.ZodString>;
                storage: z.ZodOptional<z.ZodString>;
                replicas: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                replicas: number;
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
            }, {
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
                replicas?: number | undefined;
            }>>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            type: ComponentType;
            id: string;
            name: string;
            version: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            description?: string | undefined;
            resources?: {
                replicas: number;
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
            } | undefined;
            metadata?: Record<string, string> | undefined;
        }, {
            type: ComponentType;
            id: string;
            name: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            description?: string | undefined;
            version?: string | undefined;
            resources?: {
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
                replicas?: number | undefined;
            } | undefined;
            tags?: string[] | undefined;
            metadata?: Record<string, string> | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
        }>, "many">;
        connections: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sourceId: z.ZodString;
            targetId: z.ZodString;
            type: z.ZodNativeEnum<typeof ConnectionType>;
            config: z.ZodOptional<z.ZodObject<{
                protocol: z.ZodOptional<z.ZodString>;
                port: z.ZodOptional<z.ZodNumber>;
                path: z.ZodOptional<z.ZodString>;
                timeout: z.ZodOptional<z.ZodNumber>;
                retries: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            }, {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            }>>;
            performance: z.ZodOptional<z.ZodObject<{
                bandwidth: z.ZodOptional<z.ZodString>;
                latency: z.ZodOptional<z.ZodString>;
                throughput: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            }, {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }, {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }>, "many">;
        patterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        author: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodDefault<z.ZodDate>;
        updatedAt: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        version: string;
        tags: string[];
        createdAt: Date;
        updatedAt: Date;
        mode: "light" | "heavy" | "deployment";
        components: {
            type: ComponentType;
            id: string;
            name: string;
            version: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            description?: string | undefined;
            resources?: {
                replicas: number;
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
            } | undefined;
            metadata?: Record<string, string> | undefined;
        }[];
        connections: {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }[];
        patterns: string[];
        description?: string | undefined;
        author?: string | undefined;
    }, {
        id: string;
        name: string;
        mode: "light" | "heavy" | "deployment";
        components: {
            type: ComponentType;
            id: string;
            name: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            description?: string | undefined;
            version?: string | undefined;
            resources?: {
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
                replicas?: number | undefined;
            } | undefined;
            tags?: string[] | undefined;
            metadata?: Record<string, string> | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
        }[];
        connections: {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }[];
        description?: string | undefined;
        version?: string | undefined;
        tags?: string[] | undefined;
        createdAt?: Date | undefined;
        updatedAt?: Date | undefined;
        patterns?: string[] | undefined;
        author?: string | undefined;
    }>;
    Pattern: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        category: z.ZodNativeEnum<typeof PatternCategory>;
        components: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodNativeEnum<typeof ComponentType>;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            version: z.ZodDefault<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            config: z.ZodRecord<z.ZodString, z.ZodAny>;
            resources: z.ZodOptional<z.ZodObject<{
                cpu: z.ZodOptional<z.ZodString>;
                memory: z.ZodOptional<z.ZodString>;
                storage: z.ZodOptional<z.ZodString>;
                replicas: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                replicas: number;
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
            }, {
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
                replicas?: number | undefined;
            }>>;
            tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            createdAt: z.ZodDefault<z.ZodDate>;
            updatedAt: z.ZodDefault<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            type: ComponentType;
            id: string;
            name: string;
            version: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            description?: string | undefined;
            resources?: {
                replicas: number;
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
            } | undefined;
            metadata?: Record<string, string> | undefined;
        }, {
            type: ComponentType;
            id: string;
            name: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            description?: string | undefined;
            version?: string | undefined;
            resources?: {
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
                replicas?: number | undefined;
            } | undefined;
            tags?: string[] | undefined;
            metadata?: Record<string, string> | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
        }>, "many">;
        connections: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sourceId: z.ZodString;
            targetId: z.ZodString;
            type: z.ZodNativeEnum<typeof ConnectionType>;
            config: z.ZodOptional<z.ZodObject<{
                protocol: z.ZodOptional<z.ZodString>;
                port: z.ZodOptional<z.ZodNumber>;
                path: z.ZodOptional<z.ZodString>;
                timeout: z.ZodOptional<z.ZodNumber>;
                retries: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            }, {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            }>>;
            performance: z.ZodOptional<z.ZodObject<{
                bandwidth: z.ZodOptional<z.ZodString>;
                latency: z.ZodOptional<z.ZodString>;
                throughput: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            }, {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }, {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }>, "many">;
        template: z.ZodObject<{
            variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            customization: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            variables?: Record<string, any> | undefined;
            customization?: Record<string, any> | undefined;
        }, {
            variables?: Record<string, any> | undefined;
            customization?: Record<string, any> | undefined;
        }>;
        documentation: z.ZodObject<{
            overview: z.ZodString;
            useCases: z.ZodArray<z.ZodString, "many">;
            benefits: z.ZodArray<z.ZodString, "many">;
            tradeoffs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                description: z.ZodString;
                config: z.ZodRecord<z.ZodString, z.ZodAny>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                description: string;
                config: Record<string, any>;
            }, {
                name: string;
                description: string;
                config: Record<string, any>;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            overview: string;
            useCases: string[];
            benefits: string[];
            tradeoffs?: string[] | undefined;
            examples?: {
                name: string;
                description: string;
                config: Record<string, any>;
            }[] | undefined;
        }, {
            overview: string;
            useCases: string[];
            benefits: string[];
            tradeoffs?: string[] | undefined;
            examples?: {
                name: string;
                description: string;
                config: Record<string, any>;
            }[] | undefined;
        }>;
        performance: z.ZodOptional<z.ZodObject<{
            latency: z.ZodOptional<z.ZodString>;
            throughput: z.ZodOptional<z.ZodString>;
            scalability: z.ZodOptional<z.ZodString>;
            availability: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            latency?: string | undefined;
            throughput?: string | undefined;
            scalability?: string | undefined;
            availability?: string | undefined;
        }, {
            latency?: string | undefined;
            throughput?: string | undefined;
            scalability?: string | undefined;
            availability?: string | undefined;
        }>>;
        implementation: z.ZodObject<{
            complexity: z.ZodEnum<["low", "medium", "high"]>;
            estimatedTime: z.ZodString;
            prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            complexity: "low" | "medium" | "high";
            estimatedTime: string;
            prerequisites: string[];
        }, {
            complexity: "low" | "medium" | "high";
            estimatedTime: string;
            prerequisites?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description: string;
        components: {
            type: ComponentType;
            id: string;
            name: string;
            version: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            tags: string[];
            createdAt: Date;
            updatedAt: Date;
            description?: string | undefined;
            resources?: {
                replicas: number;
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
            } | undefined;
            metadata?: Record<string, string> | undefined;
        }[];
        connections: {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }[];
        category: PatternCategory;
        template: {
            variables?: Record<string, any> | undefined;
            customization?: Record<string, any> | undefined;
        };
        documentation: {
            overview: string;
            useCases: string[];
            benefits: string[];
            tradeoffs?: string[] | undefined;
            examples?: {
                name: string;
                description: string;
                config: Record<string, any>;
            }[] | undefined;
        };
        implementation: {
            complexity: "low" | "medium" | "high";
            estimatedTime: string;
            prerequisites: string[];
        };
        performance?: {
            latency?: string | undefined;
            throughput?: string | undefined;
            scalability?: string | undefined;
            availability?: string | undefined;
        } | undefined;
    }, {
        id: string;
        name: string;
        description: string;
        components: {
            type: ComponentType;
            id: string;
            name: string;
            position: {
                x: number;
                y: number;
            };
            config: Record<string, any>;
            description?: string | undefined;
            version?: string | undefined;
            resources?: {
                cpu?: string | undefined;
                memory?: string | undefined;
                storage?: string | undefined;
                replicas?: number | undefined;
            } | undefined;
            tags?: string[] | undefined;
            metadata?: Record<string, string> | undefined;
            createdAt?: Date | undefined;
            updatedAt?: Date | undefined;
        }[];
        connections: {
            type: ConnectionType;
            id: string;
            sourceId: string;
            targetId: string;
            config?: {
                path?: string | undefined;
                protocol?: string | undefined;
                port?: number | undefined;
                timeout?: number | undefined;
                retries?: number | undefined;
            } | undefined;
            performance?: {
                bandwidth?: string | undefined;
                latency?: string | undefined;
                throughput?: string | undefined;
            } | undefined;
        }[];
        category: PatternCategory;
        template: {
            variables?: Record<string, any> | undefined;
            customization?: Record<string, any> | undefined;
        };
        documentation: {
            overview: string;
            useCases: string[];
            benefits: string[];
            tradeoffs?: string[] | undefined;
            examples?: {
                name: string;
                description: string;
                config: Record<string, any>;
            }[] | undefined;
        };
        implementation: {
            complexity: "low" | "medium" | "high";
            estimatedTime: string;
            prerequisites?: string[] | undefined;
        };
        performance?: {
            latency?: string | undefined;
            throughput?: string | undefined;
            scalability?: string | undefined;
            availability?: string | undefined;
        } | undefined;
    }>;
    ServiceBuilderConfig: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        framework: z.ZodNativeEnum<typeof FrameworkType>;
        endpoints: z.ZodDefault<z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH"]>;
            description: z.ZodOptional<z.ZodString>;
            requestSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            responseSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            authentication: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            path: string;
            method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
            authentication: boolean;
            description?: string | undefined;
            requestSchema?: Record<string, any> | undefined;
            responseSchema?: Record<string, any> | undefined;
        }, {
            path: string;
            method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
            description?: string | undefined;
            requestSchema?: Record<string, any> | undefined;
            responseSchema?: Record<string, any> | undefined;
            authentication?: boolean | undefined;
        }>, "many">>;
        database: z.ZodOptional<z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["postgresql", "mysql", "mongodb", "sqlite"]>>;
            models: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                fields: z.ZodRecord<z.ZodString, z.ZodAny>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                fields: Record<string, any>;
            }, {
                name: string;
                fields: Record<string, any>;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            models: {
                name: string;
                fields: Record<string, any>;
            }[];
            type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
        }, {
            type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
            models?: {
                name: string;
                fields: Record<string, any>;
            }[] | undefined;
        }>>;
        generatedCode: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        dockerConfig: z.ZodOptional<z.ZodString>;
        kubernetesConfig: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        framework: FrameworkType;
        endpoints: {
            path: string;
            method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
            authentication: boolean;
            description?: string | undefined;
            requestSchema?: Record<string, any> | undefined;
            responseSchema?: Record<string, any> | undefined;
        }[];
        database?: {
            models: {
                name: string;
                fields: Record<string, any>;
            }[];
            type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
        } | undefined;
        generatedCode?: Record<string, string> | undefined;
        dockerConfig?: string | undefined;
        kubernetesConfig?: string | undefined;
    }, {
        id: string;
        name: string;
        framework: FrameworkType;
        database?: {
            type?: "postgresql" | "mysql" | "mongodb" | "sqlite" | undefined;
            models?: {
                name: string;
                fields: Record<string, any>;
            }[] | undefined;
        } | undefined;
        endpoints?: {
            path: string;
            method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
            description?: string | undefined;
            requestSchema?: Record<string, any> | undefined;
            responseSchema?: Record<string, any> | undefined;
            authentication?: boolean | undefined;
        }[] | undefined;
        generatedCode?: Record<string, string> | undefined;
        dockerConfig?: string | undefined;
        kubernetesConfig?: string | undefined;
    }>;
    MLModelConfig: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        taskType: z.ZodNativeEnum<typeof MLTaskType>;
        framework: z.ZodNativeEnum<typeof FrameworkType>;
        architecture: z.ZodObject<{
            type: z.ZodString;
            layers: z.ZodOptional<z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                config: z.ZodRecord<z.ZodString, z.ZodAny>;
            }, "strip", z.ZodTypeAny, {
                type: string;
                config: Record<string, any>;
            }, {
                type: string;
                config: Record<string, any>;
            }>, "many">>;
            parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            layers?: {
                type: string;
                config: Record<string, any>;
            }[] | undefined;
            parameters?: Record<string, any> | undefined;
        }, {
            type: string;
            layers?: {
                type: string;
                config: Record<string, any>;
            }[] | undefined;
            parameters?: Record<string, any> | undefined;
        }>;
        training: z.ZodObject<{
            dataSource: z.ZodOptional<z.ZodString>;
            batchSize: z.ZodDefault<z.ZodNumber>;
            epochs: z.ZodDefault<z.ZodNumber>;
            learningRate: z.ZodDefault<z.ZodNumber>;
            optimizer: z.ZodDefault<z.ZodString>;
            lossFunction: z.ZodOptional<z.ZodString>;
            metrics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            metrics: string[];
            batchSize: number;
            epochs: number;
            learningRate: number;
            optimizer: string;
            dataSource?: string | undefined;
            lossFunction?: string | undefined;
        }, {
            metrics?: string[] | undefined;
            dataSource?: string | undefined;
            batchSize?: number | undefined;
            epochs?: number | undefined;
            learningRate?: number | undefined;
            optimizer?: string | undefined;
            lossFunction?: string | undefined;
        }>;
        serving: z.ZodOptional<z.ZodObject<{
            endpoint: z.ZodOptional<z.ZodString>;
            batchSize: z.ZodDefault<z.ZodNumber>;
            timeout: z.ZodDefault<z.ZodNumber>;
            scalingConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            timeout: number;
            batchSize: number;
            endpoint?: string | undefined;
            scalingConfig?: Record<string, any> | undefined;
        }, {
            timeout?: number | undefined;
            batchSize?: number | undefined;
            endpoint?: string | undefined;
            scalingConfig?: Record<string, any> | undefined;
        }>>;
        generatedCode: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        trainingScript: z.ZodOptional<z.ZodString>;
        servingScript: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        framework: FrameworkType;
        taskType: MLTaskType;
        architecture: {
            type: string;
            layers?: {
                type: string;
                config: Record<string, any>;
            }[] | undefined;
            parameters?: Record<string, any> | undefined;
        };
        training: {
            metrics: string[];
            batchSize: number;
            epochs: number;
            learningRate: number;
            optimizer: string;
            dataSource?: string | undefined;
            lossFunction?: string | undefined;
        };
        serving?: {
            timeout: number;
            batchSize: number;
            endpoint?: string | undefined;
            scalingConfig?: Record<string, any> | undefined;
        } | undefined;
        generatedCode?: Record<string, string> | undefined;
        trainingScript?: string | undefined;
        servingScript?: string | undefined;
    }, {
        id: string;
        name: string;
        framework: FrameworkType;
        taskType: MLTaskType;
        architecture: {
            type: string;
            layers?: {
                type: string;
                config: Record<string, any>;
            }[] | undefined;
            parameters?: Record<string, any> | undefined;
        };
        training: {
            metrics?: string[] | undefined;
            dataSource?: string | undefined;
            batchSize?: number | undefined;
            epochs?: number | undefined;
            learningRate?: number | undefined;
            optimizer?: string | undefined;
            lossFunction?: string | undefined;
        };
        serving?: {
            timeout?: number | undefined;
            batchSize?: number | undefined;
            endpoint?: string | undefined;
            scalingConfig?: Record<string, any> | undefined;
        } | undefined;
        generatedCode?: Record<string, string> | undefined;
        trainingScript?: string | undefined;
        servingScript?: string | undefined;
    }>;
    SimulationConfig: z.ZodObject<{
        id: z.ZodString;
        systemId: z.ZodString;
        duration: z.ZodDefault<z.ZodNumber>;
        users: z.ZodDefault<z.ZodNumber>;
        requestsPerSecond: z.ZodDefault<z.ZodNumber>;
        trafficPattern: z.ZodDefault<z.ZodEnum<["constant", "spike", "gradual", "random"]>>;
        failureScenarios: z.ZodDefault<z.ZodArray<z.ZodObject<{
            componentId: z.ZodString;
            failureType: z.ZodEnum<["crash", "slow", "network", "resource"]>;
            probability: z.ZodNumber;
            duration: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            componentId: string;
            failureType: "crash" | "slow" | "network" | "resource";
            probability: number;
            duration?: number | undefined;
        }, {
            componentId: string;
            failureType: "crash" | "slow" | "network" | "resource";
            probability: number;
            duration?: number | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        systemId: string;
        duration: number;
        users: number;
        requestsPerSecond: number;
        trafficPattern: "constant" | "spike" | "gradual" | "random";
        failureScenarios: {
            componentId: string;
            failureType: "crash" | "slow" | "network" | "resource";
            probability: number;
            duration?: number | undefined;
        }[];
    }, {
        id: string;
        systemId: string;
        duration?: number | undefined;
        users?: number | undefined;
        requestsPerSecond?: number | undefined;
        trafficPattern?: "constant" | "spike" | "gradual" | "random" | undefined;
        failureScenarios?: {
            componentId: string;
            failureType: "crash" | "slow" | "network" | "resource";
            probability: number;
            duration?: number | undefined;
        }[] | undefined;
    }>;
    SimulationResult: z.ZodObject<{
        id: z.ZodString;
        configId: z.ZodString;
        metrics: z.ZodObject<{
            totalRequests: z.ZodNumber;
            successfulRequests: z.ZodNumber;
            failedRequests: z.ZodNumber;
            averageLatency: z.ZodNumber;
            p95Latency: z.ZodNumber;
            p99Latency: z.ZodNumber;
            throughput: z.ZodNumber;
            errorRate: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            throughput: number;
            totalRequests: number;
            successfulRequests: number;
            failedRequests: number;
            averageLatency: number;
            p95Latency: number;
            p99Latency: number;
            errorRate: number;
        }, {
            throughput: number;
            totalRequests: number;
            successfulRequests: number;
            failedRequests: number;
            averageLatency: number;
            p95Latency: number;
            p99Latency: number;
            errorRate: number;
        }>;
        componentMetrics: z.ZodRecord<z.ZodString, z.ZodObject<{
            cpu: z.ZodNumber;
            memory: z.ZodNumber;
            network: z.ZodNumber;
            latency: z.ZodNumber;
            throughput: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            cpu: number;
            memory: number;
            latency: number;
            throughput: number;
            network: number;
        }, {
            cpu: number;
            memory: number;
            latency: number;
            throughput: number;
            network: number;
        }>>;
        resourceUtilization: z.ZodObject<{
            totalCPU: z.ZodNumber;
            totalMemory: z.ZodNumber;
            totalStorage: z.ZodNumber;
            estimatedCost: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            totalCPU: number;
            totalMemory: number;
            totalStorage: number;
            estimatedCost?: number | undefined;
        }, {
            totalCPU: number;
            totalMemory: number;
            totalStorage: number;
            estimatedCost?: number | undefined;
        }>;
        bottlenecks: z.ZodDefault<z.ZodArray<z.ZodObject<{
            componentId: z.ZodString;
            type: z.ZodString;
            severity: z.ZodEnum<["low", "medium", "high"]>;
            description: z.ZodString;
            recommendation: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            description: string;
            recommendation: string;
            componentId: string;
            severity: "low" | "medium" | "high";
        }, {
            type: string;
            description: string;
            recommendation: string;
            componentId: string;
            severity: "low" | "medium" | "high";
        }>, "many">>;
        executedAt: z.ZodDefault<z.ZodDate>;
        duration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        metrics: {
            throughput: number;
            totalRequests: number;
            successfulRequests: number;
            failedRequests: number;
            averageLatency: number;
            p95Latency: number;
            p99Latency: number;
            errorRate: number;
        };
        id: string;
        duration: number;
        configId: string;
        componentMetrics: Record<string, {
            cpu: number;
            memory: number;
            latency: number;
            throughput: number;
            network: number;
        }>;
        resourceUtilization: {
            totalCPU: number;
            totalMemory: number;
            totalStorage: number;
            estimatedCost?: number | undefined;
        };
        bottlenecks: {
            type: string;
            description: string;
            recommendation: string;
            componentId: string;
            severity: "low" | "medium" | "high";
        }[];
        executedAt: Date;
    }, {
        metrics: {
            throughput: number;
            totalRequests: number;
            successfulRequests: number;
            failedRequests: number;
            averageLatency: number;
            p95Latency: number;
            p99Latency: number;
            errorRate: number;
        };
        id: string;
        duration: number;
        configId: string;
        componentMetrics: Record<string, {
            cpu: number;
            memory: number;
            latency: number;
            throughput: number;
            network: number;
        }>;
        resourceUtilization: {
            totalCPU: number;
            totalMemory: number;
            totalStorage: number;
            estimatedCost?: number | undefined;
        };
        bottlenecks?: {
            type: string;
            description: string;
            recommendation: string;
            componentId: string;
            severity: "low" | "medium" | "high";
        }[] | undefined;
        executedAt?: Date | undefined;
    }>;
    DeploymentConfig: z.ZodObject<{
        id: z.ZodString;
        systemId: z.ZodString;
        target: z.ZodNativeEnum<typeof DeploymentTarget>;
        config: z.ZodRecord<z.ZodString, z.ZodAny>;
        manifests: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        status: z.ZodDefault<z.ZodEnum<["pending", "deploying", "deployed", "failed"]>>;
        deployedAt: z.ZodOptional<z.ZodDate>;
        environment: z.ZodDefault<z.ZodEnum<["development", "staging", "production"]>>;
        secrets: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>, "many">>;
        configMaps: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            data: z.ZodRecord<z.ZodString, z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            data: Record<string, string>;
        }, {
            name: string;
            data: Record<string, string>;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "deploying" | "deployed" | "failed";
        id: string;
        config: Record<string, any>;
        systemId: string;
        target: DeploymentTarget;
        environment: "development" | "staging" | "production";
        secrets: {
            value: string;
            name: string;
        }[];
        configMaps: {
            name: string;
            data: Record<string, string>;
        }[];
        manifests?: Record<string, string> | undefined;
        deployedAt?: Date | undefined;
    }, {
        id: string;
        config: Record<string, any>;
        systemId: string;
        target: DeploymentTarget;
        status?: "pending" | "deploying" | "deployed" | "failed" | undefined;
        manifests?: Record<string, string> | undefined;
        deployedAt?: Date | undefined;
        environment?: "development" | "staging" | "production" | undefined;
        secrets?: {
            value: string;
            name: string;
        }[] | undefined;
        configMaps?: {
            name: string;
            data: Record<string, string>;
        }[] | undefined;
    }>;
    ApiResponse: z.ZodObject<{
        success: z.ZodBoolean;
        data: z.ZodOptional<z.ZodAny>;
        error: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        success: boolean;
        timestamp: Date;
        data?: any;
        error?: string | undefined;
    }, {
        success: boolean;
        data?: any;
        error?: string | undefined;
        timestamp?: Date | undefined;
    }>;
};
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
export declare class ScaleSimError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
}
export declare class ValidationError extends ScaleSimError {
    constructor(message: string);
}
export declare class NotFoundError extends ScaleSimError {
    constructor(resource: string);
}
export declare class UnauthorizedError extends ScaleSimError {
    constructor(message?: string);
}
//# sourceMappingURL=index.d.ts.map