import { z } from 'zod';
import { ValidationError } from '../types/index';

/**
 * Validate data against a Zod schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Validation failed', error.errors);
    }
    throw error;
  }
}

/**
 * Safely validate data and return result with error
 */
export function safeValidateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate required environment variables
 */
export function validateEnvVars(requiredVars: string[]): void {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Validate component configuration
 */
export function validateComponentConfig(config: unknown): boolean {
  return !!config && typeof config === 'object';
}

/**
 * Validate system design configuration
 */
export function validateSystemDesign(design: unknown): boolean {
  return (
    !!design &&
    typeof design === 'object' &&
    'components' in design &&
    'connections' in design &&
    Array.isArray((design as any).components) &&
    Array.isArray((design as any).connections)
  );
}

/**
 * Validate network ports
 */
export function validatePort(port: number): boolean {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Kubernetes resource name
 */
export function validateK8sName(name: string): boolean {
  const k8sNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
  return k8sNameRegex.test(name) && name.length <= 63;
}

/**
 * Validate Docker image name
 */
export function validateDockerImageName(imageName: string): boolean {
  const dockerImageRegex = /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[a-zA-Z0-9._-]+)?$/;
  return dockerImageRegex.test(imageName);
}

export function safeValidation<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.errors };
} 