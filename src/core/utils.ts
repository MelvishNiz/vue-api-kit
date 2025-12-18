/**
 * Shared utility functions for API definitions
 */

/**
 * Check if an object is an API definition (has a 'path' property)
 * @param obj - Object to check
 * @returns True if the object is an API definition
 */
export function isApiDefinition(obj: any): boolean {
  return obj && typeof obj === "object" && "path" in obj;
}
