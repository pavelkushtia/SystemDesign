/**
 * Generate a unique UUID v4
 */
export declare function generateId(): string;
/**
 * Generate a deterministic UUID v5 based on name and namespace
 */
export declare function generateDeterministicId(name: string, namespace?: string): string;
/**
 * Generate a short ID for display purposes
 */
export declare function generateShortId(): string;
/**
 * Validate if a string is a valid UUID
 */
export declare function isValidId(id: string): boolean;
/**
 * Generate a component ID with type prefix
 */
export declare function generateComponentId(type: string): string;
/**
 * Generate a pattern ID based on category and name
 */
export declare function generatePatternId(category: string, name: string): string;
//# sourceMappingURL=id.d.ts.map