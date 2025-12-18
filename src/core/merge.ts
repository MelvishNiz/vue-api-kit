import type { ApiQuery, ApiMutation, NestedApiDefinitions } from "./types";

/* -------------------------------------------------------------------------- */
/*                           DEFINE HELPERS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Helper function to define a query with proper type inference
 * Eliminates the need for 'as const' assertions
 * @template T - Query definition type
 * @param query - Query definition object
 * @returns The same query with proper type inference
 * @example
 * export const userQueries = {
 *   getUsers: defineQuery({
 *     method: 'GET',
 *     path: '/users',
 *     response: z.array(UserSchema)
 *   })
 * };
 */
export function defineQuery<T extends ApiQuery>(query: T): T {
  return query;
}

/**
 * Helper function to define a mutation with proper type inference
 * Eliminates the need for 'as const' assertions
 * @template T - Mutation definition type
 * @param mutation - Mutation definition object
 * @returns The same mutation with proper type inference
 * @example
 * export const userMutations = {
 *   createUser: defineMutation({
 *     method: 'POST',
 *     path: '/users',
 *     data: CreateUserSchema,
 *     response: UserSchema
 *   })
 * };
 */
export function defineMutation<T extends ApiMutation>(mutation: T): T {
  return mutation;
}

/* -------------------------------------------------------------------------- */
/*                           MERGE UTILITIES                                  */
/* -------------------------------------------------------------------------- */

/**
 * Deep merge utility that handles nested objects
 */
function deepMerge<T extends Record<string, any>>(...objects: T[]): T {
  const result: any = {};

  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !('path' in value)) {
        // It's a nested object (not an API definition), merge recursively
        result[key] = deepMerge(result[key] || {}, value);
      } else {
        // It's an API definition or primitive, just assign
        result[key] = value;
      }
    }
  }

  return result as T;
}

/**
 * Merges multiple query definitions into a single queries object with full type safety
 * Supports both flat and nested structures
 * @template T - Array of query definition objects
 * @param queryDefinitions - Array of query definition objects to merge
 * @returns Combined queries object with all properties from input objects
 * @example
 * const userQueries = {
 *   getUsers: { path: '/users', response: z.array(UserSchema) },
 *   getUser: { path: '/users/{id}', params: z.object({ id: z.number() }), response: UserSchema }
 * };
 *
 * const postQueries = {
 *   getPosts: { path: '/posts', response: z.array(PostSchema) }
 * };
 *
 * const allQueries = mergeQueries(userQueries, postQueries);
 * // Result: { getUsers, getUser, getPosts } with full type inference
 * @example
 * // Nested structure
 * const authQueries = {
 *   auth: {
 *     me: { path: '/auth/me' },
 *     profile: { path: '/auth/profile' }
 *   }
 * };
 * 
 * const userQueries = {
 *   users: {
 *     list: { path: '/users' }
 *   }
 * };
 * 
 * const allQueries = mergeQueries(authQueries, userQueries);
 * // Result: { auth: { me, profile }, users: { list } }
 */
export function mergeQueries<
  T extends Array<NestedApiDefinitions<ApiQuery>>
>(...queryDefinitions: T): UnionToIntersection<T[number]> {
  return deepMerge(...queryDefinitions) as UnionToIntersection<T[number]>;
}

/**
 * Merges multiple mutation definitions into a single mutations object with full type safety
 * Supports both flat and nested structures
 * @template T - Array of mutation definition objects
 * @param mutationDefinitions - Array of mutation definition objects to merge
 * @returns Combined mutations object with all properties from input objects
 * @example
 * const userMutations = {
 *   createUser: { method: 'POST', path: '/users', data: CreateUserSchema, response: UserSchema },
 *   updateUser: { method: 'PUT', path: '/users/{id}', params: z.object({ id: z.number() }), data: UpdateUserSchema, response: UserSchema }
 * };
 *
 * const postMutations = {
 *   createPost: { method: 'POST', path: '/posts', data: CreatePostSchema, response: PostSchema }
 * };
 *
 * const allMutations = mergeMutations(userMutations, postMutations);
 * // Result: { createUser, updateUser, createPost } with full type inference
 * @example
 * // Nested structure
 * const authMutations = {
 *   auth: {
 *     login: { method: 'POST', path: '/auth/login' },
 *     logout: { method: 'POST', path: '/auth/logout' }
 *   }
 * };
 * 
 * const userMutations = {
 *   users: {
 *     create: { method: 'POST', path: '/users' }
 *   }
 * };
 * 
 * const allMutations = mergeMutations(authMutations, userMutations);
 * // Result: { auth: { login, logout }, users: { create } }
 */
export function mergeMutations<
  T extends Array<NestedApiDefinitions<ApiMutation>>
>(...mutationDefinitions: T): UnionToIntersection<T[number]> {
  return deepMerge(...mutationDefinitions) as UnionToIntersection<T[number]>;
}

/* -------------------------------------------------------------------------- */
/*                                TYPE UTILITIES                              */
/* -------------------------------------------------------------------------- */

/**
 * Utility type to convert union types to intersection types
 * This enables proper type merging for API definitions
 */
type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;


