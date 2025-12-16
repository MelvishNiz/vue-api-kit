import type { ApiQuery, ApiMutation, ApiClientOptions } from "./types";

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

/**
 * Merges multiple partial API client options into a single complete configuration
 * This is useful when you want to combine API definitions from different modules
 * @template T - Array of partial API client options
 * @param options - Array of partial API options to merge (baseURL from first option is used)
 * @returns Merged API client options with combined queries and mutations
 * @example
 * const userApi = {
 *   queries: { getUsers: {...}, getUser: {...} },
 *   mutations: { createUser: {...}, updateUser: {...} }
 * };
 * 
 * const postApi = {
 *   queries: { getPosts: {...}, getPost: {...} },
 *   mutations: { createPost: {...}, updatePost: {...} }
 * };
 * 
 * const completeApi = mergeApiDefinitions(
 *   { baseURL: 'https://api.example.com' },
 *   userApi,
 *   postApi
 * );
 * // Result: Full API config with all queries and mutations merged
 */
export function mergeApiDefinitions<
  T extends Array<Partial<ApiClientOptions>>
>(...options: T): MergeApiOptions<T> {
  const merged: any = {
    baseURL: '',
    queries: {},
    mutations: {},
  };

  for (const option of options) {
    if (option.baseURL && !merged.baseURL) {
      merged.baseURL = option.baseURL;
    }
    
    if (option.headers) {
      merged.headers = { ...merged.headers, ...option.headers };
    }
    
    if (option.withCredentials !== undefined) {
      merged.withCredentials = option.withCredentials;
    }
    
    if (option.queries) {
      merged.queries = { ...merged.queries, ...option.queries };
    }
    
    if (option.mutations) {
      merged.mutations = { ...merged.mutations, ...option.mutations };
    }
    
    // Merge callbacks - last one wins for each callback
    if (option.onBeforeRequest) {
      merged.onBeforeRequest = option.onBeforeRequest;
    }
    
    if (option.onStartRequest) {
      merged.onStartRequest = option.onStartRequest;
    }
    
    if (option.onFinishRequest) {
      merged.onFinishRequest = option.onFinishRequest;
    }
    
    if (option.onErrorRequest) {
      merged.onErrorRequest = option.onErrorRequest;
    }
    
    if (option.onZodError) {
      merged.onZodError = option.onZodError;
    }
  }

  return merged as MergeApiOptions<T>;
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

/**
 * Utility type to merge API client options while preserving type information
 */
type MergeApiOptions<T extends Array<Partial<ApiClientOptions>>> = {
  baseURL: string;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  queries: UnionToIntersection<NonNullable<T[number]['queries']>>;
  mutations: UnionToIntersection<NonNullable<T[number]['mutations']>>;
  onBeforeRequest?: T[number]['onBeforeRequest'];
  onStartRequest?: T[number]['onStartRequest'];
  onFinishRequest?: T[number]['onFinishRequest'];
  onErrorRequest?: T[number]['onErrorRequest'];
  onZodError?: T[number]['onZodError'];
};
