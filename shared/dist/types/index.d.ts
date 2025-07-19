import { z } from 'zod';
export declare enum SystemMode {
    LIGHT = "light",
    HEAVY = "heavy",
    DEPLOYMENT = "deployment"
}
export declare enum ComponentType {
    API_GATEWAY = "api-gateway",
    LOAD_BALANCER = "load-balancer",
    MICROSERVICE = "microservice",
    DATABASE = "database",
    CACHE = "cache",
    MESSAGE_QUEUE = "message-queue",
    ML_MODEL = "ml-model",
    CDN = "cdn"
}
export declare enum PatternCategory {
    DISTRIBUTED_SYSTEMS = "distributed-systems",
    MICROSERVICES = "microservices",
    ML_AI = "ml-ai",
    DATA_PROCESSING = "data-processing",
    SECURITY = "security",
    MONITORING = "monitoring"
}
export declare enum FrameworkType {
    SPRING_BOOT = "spring-boot",
    DJANGO = "django",
    EXPRESS = "express",
    FASTAPI = "fastapi",
    FLASK = "flask",
    LARAVEL = "laravel",
    PYTORCH = "pytorch",
    TENSORFLOW = "tensorflow",
    SCIKIT_LEARN = "scikit-learn"
}
export declare enum DeploymentTarget {
    KUBERNETES = "kubernetes",
    DOCKER_COMPOSE = "docker-compose",
    TERRAFORM = "terraform",
    AWS_ECS = "aws-ecs",
    GCP_GKE = "gcp-gke",
    AZURE_AKS = "azure-aks"
}
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    password_hash: z.ZodOptional<z.ZodString>;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    avatar_url: z.ZodOptional<z.ZodString>;
    email_verified: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
    password_hash?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    avatar_url?: string | undefined;
}, {
    id: string;
    email: string;
    password_hash?: string | undefined;
    first_name?: string | undefined;
    last_name?: string | undefined;
    avatar_url?: string | undefined;
    email_verified?: boolean | undefined;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
}>;
export declare const OAuthProviderSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    provider: z.ZodEnum<["google", "github", "linkedin", "facebook"]>;
    provider_id: z.ZodString;
    access_token: z.ZodOptional<z.ZodString>;
    refresh_token: z.ZodOptional<z.ZodString>;
    expires_at: z.ZodOptional<z.ZodDate>;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    user_id: string;
    provider: "google" | "github" | "linkedin" | "facebook";
    provider_id: string;
    access_token?: string | undefined;
    refresh_token?: string | undefined;
    expires_at?: Date | undefined;
}, {
    id: string;
    user_id: string;
    provider: "google" | "github" | "linkedin" | "facebook";
    provider_id: string;
    created_at?: Date | undefined;
    access_token?: string | undefined;
    refresh_token?: string | undefined;
    expires_at?: Date | undefined;
}>;
export declare const UserPreferencesSchema: z.ZodObject<{
    user_id: z.ZodString;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark"]>>;
    notifications: z.ZodDefault<z.ZodBoolean>;
    public_profile: z.ZodDefault<z.ZodBoolean>;
    default_project_visibility: z.ZodDefault<z.ZodEnum<["private", "public", "unlisted"]>>;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    created_at: Date;
    updated_at: Date;
    user_id: string;
    theme: "light" | "dark";
    notifications: boolean;
    public_profile: boolean;
    default_project_visibility: "private" | "public" | "unlisted";
}, {
    user_id: string;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    theme?: "light" | "dark" | undefined;
    notifications?: boolean | undefined;
    public_profile?: boolean | undefined;
    default_project_visibility?: "private" | "public" | "unlisted" | undefined;
}>;
export declare const UserSessionSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    refresh_token: z.ZodString;
    expires_at: z.ZodDate;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    user_id: string;
    refresh_token: string;
    expires_at: Date;
}, {
    id: string;
    user_id: string;
    refresh_token: string;
    expires_at: Date;
    created_at?: Date | undefined;
}>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    remember_me: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    remember_me?: boolean | undefined;
}, {
    email: string;
    password: string;
    remember_me?: boolean | undefined;
}>;
export declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    first_name: z.ZodString;
    last_name: z.ZodString;
    terms_accepted: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
}, "strip", z.ZodTypeAny, {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    terms_accepted: boolean;
}, {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    terms_accepted: boolean;
}>;
export declare const AuthResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    user: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        password_hash: z.ZodOptional<z.ZodString>;
        first_name: z.ZodOptional<z.ZodString>;
        last_name: z.ZodOptional<z.ZodString>;
        avatar_url: z.ZodOptional<z.ZodString>;
        email_verified: z.ZodDefault<z.ZodBoolean>;
        created_at: z.ZodDefault<z.ZodDate>;
        updated_at: z.ZodDefault<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        email: string;
        email_verified: boolean;
        created_at: Date;
        updated_at: Date;
        password_hash?: string | undefined;
        first_name?: string | undefined;
        last_name?: string | undefined;
        avatar_url?: string | undefined;
    }, {
        id: string;
        email: string;
        password_hash?: string | undefined;
        first_name?: string | undefined;
        last_name?: string | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        created_at?: Date | undefined;
        updated_at?: Date | undefined;
    }>>;
    access_token: z.ZodOptional<z.ZodString>;
    refresh_token: z.ZodOptional<z.ZodString>;
    expires_in: z.ZodOptional<z.ZodNumber>;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    message?: string | undefined;
    access_token?: string | undefined;
    refresh_token?: string | undefined;
    user?: {
        id: string;
        email: string;
        email_verified: boolean;
        created_at: Date;
        updated_at: Date;
        password_hash?: string | undefined;
        first_name?: string | undefined;
        last_name?: string | undefined;
        avatar_url?: string | undefined;
    } | undefined;
    expires_in?: number | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    access_token?: string | undefined;
    refresh_token?: string | undefined;
    user?: {
        id: string;
        email: string;
        password_hash?: string | undefined;
        first_name?: string | undefined;
        last_name?: string | undefined;
        avatar_url?: string | undefined;
        email_verified?: boolean | undefined;
        created_at?: Date | undefined;
        updated_at?: Date | undefined;
    } | undefined;
    expires_in?: number | undefined;
}>;
export declare const ProjectCollaboratorSchema: z.ZodObject<{
    id: z.ZodString;
    system_id: z.ZodString;
    user_id: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["owner", "admin", "collaborator", "viewer"]>>;
    permissions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    invited_by: z.ZodOptional<z.ZodString>;
    joined_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    system_id: string;
    role: "owner" | "admin" | "collaborator" | "viewer";
    joined_at: Date;
    permissions?: Record<string, boolean> | undefined;
    invited_by?: string | undefined;
}, {
    id: string;
    user_id: string;
    system_id: string;
    role?: "owner" | "admin" | "collaborator" | "viewer" | undefined;
    permissions?: Record<string, boolean> | undefined;
    invited_by?: string | undefined;
    joined_at?: Date | undefined;
}>;
export declare const ProjectMetadataSchema: z.ZodObject<{
    system_id: z.ZodString;
    readme_content: z.ZodOptional<z.ZodString>;
    documentation: z.ZodOptional<z.ZodString>;
    changelog: z.ZodOptional<z.ZodString>;
    keywords: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    license: z.ZodDefault<z.ZodString>;
    repository_url: z.ZodOptional<z.ZodString>;
    demo_url: z.ZodOptional<z.ZodString>;
    screenshots: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    created_at: z.ZodDefault<z.ZodDate>;
    updated_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    created_at: Date;
    updated_at: Date;
    system_id: string;
    keywords: string[];
    license: string;
    screenshots: string[];
    readme_content?: string | undefined;
    documentation?: string | undefined;
    changelog?: string | undefined;
    repository_url?: string | undefined;
    demo_url?: string | undefined;
}, {
    system_id: string;
    created_at?: Date | undefined;
    updated_at?: Date | undefined;
    readme_content?: string | undefined;
    documentation?: string | undefined;
    changelog?: string | undefined;
    keywords?: string[] | undefined;
    license?: string | undefined;
    repository_url?: string | undefined;
    demo_url?: string | undefined;
    screenshots?: string[] | undefined;
}>;
export declare const ProjectStarSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    system_id: z.ZodString;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    user_id: string;
    system_id: string;
}, {
    id: string;
    user_id: string;
    system_id: string;
    created_at?: Date | undefined;
}>;
export declare const UserActivitySchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    activity_type: z.ZodEnum<["create", "update", "simulate", "deploy", "fork", "star", "delete"]>;
    resource_type: z.ZodEnum<["system", "pattern", "simulation", "deployment", "service", "ml_model"]>;
    resource_id: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: Date;
    user_id: string;
    activity_type: "create" | "update" | "simulate" | "deploy" | "fork" | "star" | "delete";
    resource_type: "deployment" | "system" | "pattern" | "simulation" | "service" | "ml_model";
    resource_id: string;
    metadata?: Record<string, any> | undefined;
}, {
    id: string;
    user_id: string;
    activity_type: "create" | "update" | "simulate" | "deploy" | "fork" | "star" | "delete";
    resource_type: "deployment" | "system" | "pattern" | "simulation" | "service" | "ml_model";
    resource_id: string;
    created_at?: Date | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export declare const ComponentSpecsSchema: z.ZodObject<{
    cpu: z.ZodDefault<z.ZodNumber>;
    memory: z.ZodDefault<z.ZodNumber>;
    storage: z.ZodDefault<z.ZodNumber>;
    network: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    cpu: number;
    memory: number;
    storage: number;
    network: number;
}, {
    cpu?: number | undefined;
    memory?: number | undefined;
    storage?: number | undefined;
    network?: number | undefined;
}>;
export declare const ComponentScalingSchema: z.ZodObject<{
    min: z.ZodDefault<z.ZodNumber>;
    max: z.ZodDefault<z.ZodNumber>;
    auto: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    min: number;
    max: number;
    auto: boolean;
}, {
    min?: number | undefined;
    max?: number | undefined;
    auto?: boolean | undefined;
}>;
export declare const ComponentConfigSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodNativeEnum<typeof ComponentType>;
    name: z.ZodString;
    specs: z.ZodObject<{
        cpu: z.ZodDefault<z.ZodNumber>;
        memory: z.ZodDefault<z.ZodNumber>;
        storage: z.ZodDefault<z.ZodNumber>;
        network: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        cpu: number;
        memory: number;
        storage: number;
        network: number;
    }, {
        cpu?: number | undefined;
        memory?: number | undefined;
        storage?: number | undefined;
        network?: number | undefined;
    }>;
    scaling: z.ZodObject<{
        min: z.ZodDefault<z.ZodNumber>;
        max: z.ZodDefault<z.ZodNumber>;
        auto: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        auto: boolean;
    }, {
        min?: number | undefined;
        max?: number | undefined;
        auto?: boolean | undefined;
    }>;
    connections: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: ComponentType;
    name: string;
    specs: {
        cpu: number;
        memory: number;
        storage: number;
        network: number;
    };
    scaling: {
        min: number;
        max: number;
        auto: boolean;
    };
    connections: string[];
}, {
    id: string;
    type: ComponentType;
    name: string;
    specs: {
        cpu?: number | undefined;
        memory?: number | undefined;
        storage?: number | undefined;
        network?: number | undefined;
    };
    scaling: {
        min?: number | undefined;
        max?: number | undefined;
        auto?: boolean | undefined;
    };
    connections?: string[] | undefined;
}>;
export declare const ConnectionSchema: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    target: z.ZodString;
    type: z.ZodDefault<z.ZodString>;
    properties: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    source: string;
    target: string;
    properties: Record<string, any>;
}, {
    id: string;
    source: string;
    target: string;
    type?: string | undefined;
    properties?: Record<string, any> | undefined;
}>;
export declare const SystemModeSchema: z.ZodNativeEnum<typeof SystemMode>;
export declare const SystemDesignSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    user_id: z.ZodOptional<z.ZodString>;
    visibility: z.ZodDefault<z.ZodEnum<["private", "public", "unlisted"]>>;
    fork_count: z.ZodDefault<z.ZodNumber>;
    star_count: z.ZodDefault<z.ZodNumber>;
    original_system_id: z.ZodOptional<z.ZodString>;
    mode: z.ZodNativeEnum<typeof SystemMode>;
    components: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodNativeEnum<typeof ComponentType>;
        name: z.ZodString;
        specs: z.ZodObject<{
            cpu: z.ZodDefault<z.ZodNumber>;
            memory: z.ZodDefault<z.ZodNumber>;
            storage: z.ZodDefault<z.ZodNumber>;
            network: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            cpu: number;
            memory: number;
            storage: number;
            network: number;
        }, {
            cpu?: number | undefined;
            memory?: number | undefined;
            storage?: number | undefined;
            network?: number | undefined;
        }>;
        scaling: z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
            auto: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            auto: boolean;
        }, {
            min?: number | undefined;
            max?: number | undefined;
            auto?: boolean | undefined;
        }>;
        connections: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu: number;
            memory: number;
            storage: number;
            network: number;
        };
        scaling: {
            min: number;
            max: number;
            auto: boolean;
        };
        connections: string[];
    }, {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu?: number | undefined;
            memory?: number | undefined;
            storage?: number | undefined;
            network?: number | undefined;
        };
        scaling: {
            min?: number | undefined;
            max?: number | undefined;
            auto?: boolean | undefined;
        };
        connections?: string[] | undefined;
    }>, "many">;
    connections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
        target: z.ZodString;
        type: z.ZodDefault<z.ZodString>;
        properties: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        source: string;
        target: string;
        properties: Record<string, any>;
    }, {
        id: string;
        source: string;
        target: string;
        type?: string | undefined;
        properties?: Record<string, any> | undefined;
    }>, "many">;
    patterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    author: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    connections: {
        id: string;
        type: string;
        source: string;
        target: string;
        properties: Record<string, any>;
    }[];
    version: string;
    visibility: "private" | "public" | "unlisted";
    fork_count: number;
    star_count: number;
    mode: SystemMode;
    components: {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu: number;
            memory: number;
            storage: number;
            network: number;
        };
        scaling: {
            min: number;
            max: number;
            auto: boolean;
        };
        connections: string[];
    }[];
    patterns: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    user_id?: string | undefined;
    description?: string | undefined;
    original_system_id?: string | undefined;
    author?: string | undefined;
}, {
    id: string;
    name: string;
    connections: {
        id: string;
        source: string;
        target: string;
        type?: string | undefined;
        properties?: Record<string, any> | undefined;
    }[];
    mode: SystemMode;
    components: {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu?: number | undefined;
            memory?: number | undefined;
            storage?: number | undefined;
            network?: number | undefined;
        };
        scaling: {
            min?: number | undefined;
            max?: number | undefined;
            auto?: boolean | undefined;
        };
        connections?: string[] | undefined;
    }[];
    user_id?: string | undefined;
    description?: string | undefined;
    version?: string | undefined;
    visibility?: "private" | "public" | "unlisted" | undefined;
    fork_count?: number | undefined;
    star_count?: number | undefined;
    original_system_id?: string | undefined;
    patterns?: string[] | undefined;
    tags?: string[] | undefined;
    author?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}>;
export declare const PatternSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodNativeEnum<typeof PatternCategory>;
    components: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodNativeEnum<typeof ComponentType>;
        name: z.ZodString;
        specs: z.ZodObject<{
            cpu: z.ZodDefault<z.ZodNumber>;
            memory: z.ZodDefault<z.ZodNumber>;
            storage: z.ZodDefault<z.ZodNumber>;
            network: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            cpu: number;
            memory: number;
            storage: number;
            network: number;
        }, {
            cpu?: number | undefined;
            memory?: number | undefined;
            storage?: number | undefined;
            network?: number | undefined;
        }>;
        scaling: z.ZodObject<{
            min: z.ZodDefault<z.ZodNumber>;
            max: z.ZodDefault<z.ZodNumber>;
            auto: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            auto: boolean;
        }, {
            min?: number | undefined;
            max?: number | undefined;
            auto?: boolean | undefined;
        }>;
        connections: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu: number;
            memory: number;
            storage: number;
            network: number;
        };
        scaling: {
            min: number;
            max: number;
            auto: boolean;
        };
        connections: string[];
    }, {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu?: number | undefined;
            memory?: number | undefined;
            storage?: number | undefined;
            network?: number | undefined;
        };
        scaling: {
            min?: number | undefined;
            max?: number | undefined;
            auto?: boolean | undefined;
        };
        connections?: string[] | undefined;
    }>, "many">;
    connections: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
        target: z.ZodString;
        type: z.ZodDefault<z.ZodString>;
        properties: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        source: string;
        target: string;
        properties: Record<string, any>;
    }, {
        id: string;
        source: string;
        target: string;
        type?: string | undefined;
        properties?: Record<string, any> | undefined;
    }>, "many">;
    template: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    documentation: z.ZodObject<{
        overview: z.ZodString;
        useCases: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        benefits: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        tradeoffs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        implementation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        overview: string;
        useCases: string[];
        benefits: string[];
        tradeoffs: string[];
        implementation?: string | undefined;
    }, {
        overview: string;
        useCases?: string[] | undefined;
        benefits?: string[] | undefined;
        tradeoffs?: string[] | undefined;
        implementation?: string | undefined;
    }>;
    performance: z.ZodOptional<z.ZodObject<{
        complexity: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
        scalability: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
        reliability: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
        cost: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    }, "strip", z.ZodTypeAny, {
        complexity: "low" | "medium" | "high";
        scalability: "low" | "medium" | "high";
        reliability: "low" | "medium" | "high";
        cost: "low" | "medium" | "high";
    }, {
        complexity?: "low" | "medium" | "high" | undefined;
        scalability?: "low" | "medium" | "high" | undefined;
        reliability?: "low" | "medium" | "high" | undefined;
        cost?: "low" | "medium" | "high" | undefined;
    }>>;
    implementation: z.ZodObject<{
        frameworks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        technologies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        estimatedTime: z.ZodOptional<z.ZodString>;
        complexity: z.ZodDefault<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    }, "strip", z.ZodTypeAny, {
        complexity: "beginner" | "intermediate" | "advanced";
        frameworks: string[];
        technologies: string[];
        estimatedTime?: string | undefined;
    }, {
        complexity?: "beginner" | "intermediate" | "advanced" | undefined;
        frameworks?: string[] | undefined;
        technologies?: string[] | undefined;
        estimatedTime?: string | undefined;
    }>;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    documentation: {
        overview: string;
        useCases: string[];
        benefits: string[];
        tradeoffs: string[];
        implementation?: string | undefined;
    };
    name: string;
    connections: {
        id: string;
        type: string;
        source: string;
        target: string;
        properties: Record<string, any>;
    }[];
    description: string;
    components: {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu: number;
            memory: number;
            storage: number;
            network: number;
        };
        scaling: {
            min: number;
            max: number;
            auto: boolean;
        };
        connections: string[];
    }[];
    createdAt: Date;
    updatedAt: Date;
    category: PatternCategory;
    template: Record<string, any>;
    implementation: {
        complexity: "beginner" | "intermediate" | "advanced";
        frameworks: string[];
        technologies: string[];
        estimatedTime?: string | undefined;
    };
    performance?: {
        complexity: "low" | "medium" | "high";
        scalability: "low" | "medium" | "high";
        reliability: "low" | "medium" | "high";
        cost: "low" | "medium" | "high";
    } | undefined;
}, {
    id: string;
    documentation: {
        overview: string;
        useCases?: string[] | undefined;
        benefits?: string[] | undefined;
        tradeoffs?: string[] | undefined;
        implementation?: string | undefined;
    };
    name: string;
    connections: {
        id: string;
        source: string;
        target: string;
        type?: string | undefined;
        properties?: Record<string, any> | undefined;
    }[];
    description: string;
    components: {
        id: string;
        type: ComponentType;
        name: string;
        specs: {
            cpu?: number | undefined;
            memory?: number | undefined;
            storage?: number | undefined;
            network?: number | undefined;
        };
        scaling: {
            min?: number | undefined;
            max?: number | undefined;
            auto?: boolean | undefined;
        };
        connections?: string[] | undefined;
    }[];
    category: PatternCategory;
    implementation: {
        complexity?: "beginner" | "intermediate" | "advanced" | undefined;
        frameworks?: string[] | undefined;
        technologies?: string[] | undefined;
        estimatedTime?: string | undefined;
    };
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    template?: Record<string, any> | undefined;
    performance?: {
        complexity?: "low" | "medium" | "high" | undefined;
        scalability?: "low" | "medium" | "high" | undefined;
        reliability?: "low" | "medium" | "high" | undefined;
        cost?: "low" | "medium" | "high" | undefined;
    } | undefined;
}>;
export declare const ServiceBuilderConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    framework: z.ZodNativeEnum<typeof FrameworkType>;
    user_id: z.ZodOptional<z.ZodString>;
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
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
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
    user_id?: string | undefined;
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
    user_id?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
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
export declare const MLModelConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    taskType: z.ZodEnum<["classification", "regression", "clustering", "recommendation", "nlp", "computer_vision"]>;
    framework: z.ZodEnum<["pytorch", "tensorflow", "scikit-learn"]>;
    user_id: z.ZodOptional<z.ZodString>;
    architecture: z.ZodObject<{
        layers: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodString;
            config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            type: string;
            config?: Record<string, any> | undefined;
        }, {
            type: string;
            config?: Record<string, any> | undefined;
        }>, "many">>;
        optimizer: z.ZodOptional<z.ZodString>;
        loss: z.ZodOptional<z.ZodString>;
        metrics: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        layers: {
            type: string;
            config?: Record<string, any> | undefined;
        }[];
        metrics: string[];
        optimizer?: string | undefined;
        loss?: string | undefined;
    }, {
        layers?: {
            type: string;
            config?: Record<string, any> | undefined;
        }[] | undefined;
        optimizer?: string | undefined;
        loss?: string | undefined;
        metrics?: string[] | undefined;
    }>;
    training: z.ZodObject<{
        epochs: z.ZodDefault<z.ZodNumber>;
        batchSize: z.ZodDefault<z.ZodNumber>;
        learningRate: z.ZodDefault<z.ZodNumber>;
        validationSplit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        epochs: number;
        batchSize: number;
        learningRate: number;
        validationSplit: number;
    }, {
        epochs?: number | undefined;
        batchSize?: number | undefined;
        learningRate?: number | undefined;
        validationSplit?: number | undefined;
    }>;
    serving: z.ZodOptional<z.ZodObject<{
        endpoint: z.ZodOptional<z.ZodString>;
        batchPrediction: z.ZodDefault<z.ZodBoolean>;
        realTimeInference: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        batchPrediction: boolean;
        realTimeInference: boolean;
        endpoint?: string | undefined;
    }, {
        endpoint?: string | undefined;
        batchPrediction?: boolean | undefined;
        realTimeInference?: boolean | undefined;
    }>>;
    generatedCode: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    trainingScript: z.ZodOptional<z.ZodString>;
    servingScript: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    framework: "pytorch" | "tensorflow" | "scikit-learn";
    taskType: "classification" | "regression" | "clustering" | "recommendation" | "nlp" | "computer_vision";
    architecture: {
        layers: {
            type: string;
            config?: Record<string, any> | undefined;
        }[];
        metrics: string[];
        optimizer?: string | undefined;
        loss?: string | undefined;
    };
    training: {
        epochs: number;
        batchSize: number;
        learningRate: number;
        validationSplit: number;
    };
    user_id?: string | undefined;
    generatedCode?: Record<string, string> | undefined;
    serving?: {
        batchPrediction: boolean;
        realTimeInference: boolean;
        endpoint?: string | undefined;
    } | undefined;
    trainingScript?: string | undefined;
    servingScript?: string | undefined;
}, {
    id: string;
    name: string;
    framework: "pytorch" | "tensorflow" | "scikit-learn";
    taskType: "classification" | "regression" | "clustering" | "recommendation" | "nlp" | "computer_vision";
    architecture: {
        layers?: {
            type: string;
            config?: Record<string, any> | undefined;
        }[] | undefined;
        optimizer?: string | undefined;
        loss?: string | undefined;
        metrics?: string[] | undefined;
    };
    training: {
        epochs?: number | undefined;
        batchSize?: number | undefined;
        learningRate?: number | undefined;
        validationSplit?: number | undefined;
    };
    user_id?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    generatedCode?: Record<string, string> | undefined;
    serving?: {
        endpoint?: string | undefined;
        batchPrediction?: boolean | undefined;
        realTimeInference?: boolean | undefined;
    } | undefined;
    trainingScript?: string | undefined;
    servingScript?: string | undefined;
}>;
export declare const LoadPatternSchema: z.ZodObject<{
    users: z.ZodDefault<z.ZodNumber>;
    duration: z.ZodDefault<z.ZodNumber>;
    rampUp: z.ZodDefault<z.ZodNumber>;
    requestsPerSecond: z.ZodDefault<z.ZodNumber>;
    pattern: z.ZodDefault<z.ZodEnum<["constant", "spike", "ramp", "wave"]>>;
}, "strip", z.ZodTypeAny, {
    pattern: "constant" | "spike" | "ramp" | "wave";
    users: number;
    duration: number;
    rampUp: number;
    requestsPerSecond: number;
}, {
    pattern?: "constant" | "spike" | "ramp" | "wave" | undefined;
    users?: number | undefined;
    duration?: number | undefined;
    rampUp?: number | undefined;
    requestsPerSecond?: number | undefined;
}>;
export declare const SimulationConfigSchema: z.ZodObject<{
    id: z.ZodString;
    systemId: z.ZodString;
    user_id: z.ZodOptional<z.ZodString>;
    duration: z.ZodDefault<z.ZodNumber>;
    users: z.ZodDefault<z.ZodNumber>;
    requestsPerSecond: z.ZodDefault<z.ZodNumber>;
    trafficPattern: z.ZodDefault<z.ZodEnum<["constant", "spike", "ramp", "wave"]>>;
    failureScenarios: z.ZodDefault<z.ZodArray<z.ZodObject<{
        componentId: z.ZodString;
        failureType: z.ZodString;
        probability: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        componentId: string;
        failureType: string;
        probability: number;
    }, {
        componentId: string;
        failureType: string;
        probability: number;
    }>, "many">>;
    createdAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    users: number;
    duration: number;
    requestsPerSecond: number;
    systemId: string;
    trafficPattern: "constant" | "spike" | "ramp" | "wave";
    failureScenarios: {
        componentId: string;
        failureType: string;
        probability: number;
    }[];
    user_id?: string | undefined;
}, {
    id: string;
    systemId: string;
    user_id?: string | undefined;
    createdAt?: Date | undefined;
    users?: number | undefined;
    duration?: number | undefined;
    requestsPerSecond?: number | undefined;
    trafficPattern?: "constant" | "spike" | "ramp" | "wave" | undefined;
    failureScenarios?: {
        componentId: string;
        failureType: string;
        probability: number;
    }[] | undefined;
}>;
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
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        throughput: number;
        errorRate: number;
    }, {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        throughput: number;
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
        network: number;
        throughput: number;
        latency: number;
    }, {
        cpu: number;
        memory: number;
        network: number;
        throughput: number;
        latency: number;
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
    id: string;
    metrics: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        throughput: number;
        errorRate: number;
    };
    duration: number;
    configId: string;
    componentMetrics: Record<string, {
        cpu: number;
        memory: number;
        network: number;
        throughput: number;
        latency: number;
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
    id: string;
    metrics: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageLatency: number;
        p95Latency: number;
        p99Latency: number;
        throughput: number;
        errorRate: number;
    };
    duration: number;
    configId: string;
    componentMetrics: Record<string, {
        cpu: number;
        memory: number;
        network: number;
        throughput: number;
        latency: number;
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
export declare const DeploymentConfigSchema: z.ZodObject<{
    id: z.ZodString;
    systemId: z.ZodString;
    user_id: z.ZodOptional<z.ZodString>;
    target: z.ZodNativeEnum<typeof DeploymentTarget>;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    environment: z.ZodDefault<z.ZodEnum<["development", "staging", "production"]>>;
    manifests: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    status: z.ZodDefault<z.ZodEnum<["pending", "deploying", "deployed", "failed"]>>;
    deployedAt: z.ZodOptional<z.ZodDate>;
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
    createdAt: z.ZodDefault<z.ZodDate>;
    updatedAt: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "pending" | "deploying" | "deployed" | "failed";
    target: DeploymentTarget;
    createdAt: Date;
    updatedAt: Date;
    config: Record<string, any>;
    systemId: string;
    environment: "development" | "staging" | "production";
    secrets: {
        value: string;
        name: string;
    }[];
    configMaps: {
        name: string;
        data: Record<string, string>;
    }[];
    user_id?: string | undefined;
    manifests?: Record<string, string> | undefined;
    deployedAt?: Date | undefined;
}, {
    id: string;
    target: DeploymentTarget;
    systemId: string;
    status?: "pending" | "deploying" | "deployed" | "failed" | undefined;
    user_id?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    config?: Record<string, any> | undefined;
    environment?: "development" | "staging" | "production" | undefined;
    manifests?: Record<string, string> | undefined;
    deployedAt?: Date | undefined;
    secrets?: {
        value: string;
        name: string;
    }[] | undefined;
    configMaps?: {
        name: string;
        data: Record<string, string>;
    }[] | undefined;
}>;
export declare const ApiResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    success: boolean;
    timestamp: Date;
    message?: string | undefined;
    data?: any;
    error?: string | undefined;
}, {
    success: boolean;
    message?: string | undefined;
    data?: any;
    error?: string | undefined;
    timestamp?: Date | undefined;
}>;
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
export declare class ValidationError extends Error {
    errors: z.ZodIssue[];
    constructor(message: string, errors: z.ZodIssue[]);
}
export declare class NotFoundError extends Error {
    constructor(resource: string);
}
export declare class UnauthorizedError extends Error {
    constructor(message?: string);
}
export declare class ForbiddenError extends Error {
    constructor(message?: string);
}
//# sourceMappingURL=index.d.ts.map