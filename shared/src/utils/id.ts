import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

/**
 * Generate a unique UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a deterministic UUID v5 based on name and namespace
 */
export function generateDeterministicId(name: string, namespace: string = 'scalesim'): string {
  // Use a fixed namespace UUID for ScaleSim
  const SCALESIM_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  return uuidv5(`${namespace}:${name}`, SCALESIM_NAMESPACE);
}

/**
 * Generate a short ID for display purposes
 */
export function generateShortId(): string {
  return generateId().substring(0, 8);
}

/**
 * Validate if a string is a valid UUID
 */
export function isValidId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Generate a component ID with type prefix
 */
export function generateComponentId(type: string): string {
  const id = generateShortId();
  return `${type}-${id}`;
}

/**
 * Generate a pattern ID based on category and name
 */
export function generatePatternId(category: string, name: string): string {
  const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${category}-${cleanName}`;
} 