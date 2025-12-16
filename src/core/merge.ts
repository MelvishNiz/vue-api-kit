import type { ApiQuery, ApiMutation } from "./types";

/**
 * Merges multiple query definitions into a single queries object with full type safety
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
 */
export function mergeQueries<
  T extends Array<Record<string, ApiQuery>>
>(...queryDefinitions: T): UnionToIntersection<T[number]> {
  return Object.assign({}, ...queryDefinitions) as UnionToIntersection<T[number]>;
}

/**
 * Merges multiple mutation definitions into a single mutations object with full type safety
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
 */
export function mergeMutations<
  T extends Array<Record<string, ApiMutation>>
>(...mutationDefinitions: T): UnionToIntersection<T[number]> {
  return Object.assign({}, ...mutationDefinitions) as UnionToIntersection<T[number]>;
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

