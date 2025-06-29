import { z } from 'zod';
/**
 * Validate data against a Zod schema
 */
export declare function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T;
/**
 * Safely validate data and return result with error
 */
export declare function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
};
/**
 * Validate required environment variables
 */
export declare function validateEnvVars(requiredVars: string[]): void;
/**
 * Validate component configuration
 */
export declare function validateComponentConfig(config: unknown): boolean;
/**
 * Validate system design configuration
 */
export declare function validateSystemDesign(design: unknown): boolean;
/**
 * Validate network ports
 */
export declare function validatePort(port: number): boolean;
/**
 * Validate URL format
 */
export declare function validateUrl(url: string): boolean;
/**
 * Validate Kubernetes resource name
 */
export declare function validateK8sName(name: string): boolean;
/**
 * Validate Docker image name
 */
export declare function validateDockerImageName(imageName: string): boolean;
//# sourceMappingURL=validation.d.ts.map