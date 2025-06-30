import { z } from 'zod';
import { ValidationError } from '../types/index';
/**
 * Validate data against a Zod schema
 */
export function validateData(schema, data) {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError('Validation failed', error.errors);
        }
        throw error;
    }
}
/**
 * Safely validate data and return result with error
 */
export function safeValidateData(schema, data) {
    try {
        const validData = schema.parse(data);
        return { success: true, data: validData };
    }
    catch (error) {
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
export function validateEnvVars(requiredVars) {
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
}
/**
 * Validate component configuration
 */
export function validateComponentConfig(config) {
    return !!config && typeof config === 'object';
}
/**
 * Validate system design configuration
 */
export function validateSystemDesign(design) {
    return (!!design &&
        typeof design === 'object' &&
        'components' in design &&
        'connections' in design &&
        Array.isArray(design.components) &&
        Array.isArray(design.connections));
}
/**
 * Validate network ports
 */
export function validatePort(port) {
    return Number.isInteger(port) && port > 0 && port <= 65535;
}
/**
 * Validate URL format
 */
export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Validate Kubernetes resource name
 */
export function validateK8sName(name) {
    const k8sNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
    return k8sNameRegex.test(name) && name.length <= 63;
}
/**
 * Validate Docker image name
 */
export function validateDockerImageName(imageName) {
    const dockerImageRegex = /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[a-zA-Z0-9._-]+)?$/;
    return dockerImageRegex.test(imageName);
}
export function safeValidation(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error.errors };
}
