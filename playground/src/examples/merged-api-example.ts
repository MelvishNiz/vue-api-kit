/**
 * Merged API Client Example
 * This file demonstrates how to merge queries and mutations from separate files
 * into a single, fully type-safe API client
 */

import { createApiClient, mergeQueries, mergeMutations, mergeApiDefinitions } from '../../../dist';
import { userQueries, userMutations } from './user-api';
import { postQueries, postMutations } from './post-api';

// ============================================================================
// APPROACH 1: Merge queries and mutations separately, then create API client
// ============================================================================

export const api = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
  
  // Merge all queries from different modules
  queries: mergeQueries(userQueries, postQueries),
  
  // Merge all mutations from different modules
  mutations: mergeMutations(userMutations, postMutations),
  
  // Global handlers
  onBeforeRequest: async (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  
  onErrorRequest: ({ message, status }) => {
    console.error(`API Error [${status}]: ${message}`);
  },
});

// ============================================================================
// APPROACH 2: Merge complete API definitions
// ============================================================================

// Define separate API configurations
const userApiConfig = {
  queries: userQueries,
  mutations: userMutations,
};

const postApiConfig = {
  queries: postQueries,
  mutations: postMutations,
};

const baseConfig = {
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
  onErrorRequest: ({ message, status }: { message: string; status?: number }) => {
    console.error(`API Error [${status}]: ${message}`);
  },
};

// Merge all API definitions into one
const mergedConfig = mergeApiDefinitions(
  baseConfig,
  userApiConfig,
  postApiConfig
);

export const apiAlt = createApiClient(mergedConfig);

// ============================================================================
// USAGE EXAMPLES - Fully Typed!
// ============================================================================

/**
 * Example 1: Using user queries (from user-api.ts)
 * Full type inference: params, data, and response are all typed
 */
export function useUsersList() {
  const { result, isLoading, errorMessage, refetch } = api.query.getUsers({
    params: { page: 1, limit: 10 },
  });
  
  // result.value is typed as User[] | undefined
  // result.value[0].name ✓ (typed property)
  // result.value[0].invalidProp ✗ (TypeScript error)
  
  return { result, isLoading, errorMessage, refetch };
}

/**
 * Example 2: Using POST query for searching (from user-api.ts)
 */
export function useUserSearch() {
  const { result, isLoading, refetch } = api.query.searchUsers({
    data: {
      query: 'john',
      email: 'john@example.com',
    },
    loadOnMount: false,
  });
  
  // result.value is typed as User | undefined
  return { result, isLoading, refetch };
}

/**
 * Example 3: Using post queries (from post-api.ts)
 */
export function usePostsList() {
  const { result, isLoading } = api.query.getPosts({
    params: { userId: 1 },
  });
  
  // result.value is typed as Post[] | undefined
  return { result, isLoading };
}

/**
 * Example 4: Using user mutations (from user-api.ts)
 */
export function useCreateUser() {
  const { mutate, isLoading, result } = api.mutation.createUser({
    onResult: (user) => {
      console.log('Created user:', user.id); // user is fully typed
    },
  });
  
  const handleCreate = async () => {
    await mutate({
      data: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
      },
    });
  };
  
  return { mutate, isLoading, result, handleCreate };
}

/**
 * Example 5: Using post mutations (from post-api.ts)
 */
export function useCreatePost() {
  const { mutate, isLoading } = api.mutation.createPost({
    onResult: (post) => {
      console.log('Created post:', post.title); // post is fully typed
    },
  });
  
  return { mutate, isLoading };
}

// ============================================================================
// TYPE SAFETY DEMONSTRATION
// ============================================================================

/**
 * All of the following have full type safety:
 * 
 * 1. Query/Mutation names - IDE autocomplete works perfectly
 *    api.query.getUsers ✓
 *    api.query.invalidQuery ✗ TypeScript error
 * 
 * 2. Parameters - typed based on Zod schema
 *    api.query.getUser({ params: { id: 1 } }) ✓
 *    api.query.getUser({ params: { id: "1" } }) ✗ TypeScript error
 * 
 * 3. Request data - typed based on Zod schema
 *    api.mutation.createUser({ data: { name: "John", ... } }) ✓
 *    api.mutation.createUser({ data: { invalidField: "x" } }) ✗ TypeScript error
 * 
 * 4. Response data - typed based on Zod schema
 *    result.value?.name ✓
 *    result.value?.invalidField ✗ TypeScript error
 * 
 * 5. Callbacks - parameter types are inferred
 *    onResult: (user) => user.name ✓ (user is typed)
 */

// ============================================================================
// BENEFITS OF MODULAR APPROACH
// ============================================================================

/**
 * Benefits:
 * 
 * 1. ✅ Separation of Concerns
 *    - User API logic in user-api.ts
 *    - Post API logic in post-api.ts
 *    - Easy to navigate large codebases
 * 
 * 2. ✅ Reusability
 *    - Import queries/mutations in multiple clients
 *    - Mix and match as needed
 * 
 * 3. ✅ Team Collaboration
 *    - Different team members can work on different API modules
 *    - Reduced merge conflicts
 * 
 * 4. ✅ Full Type Safety
 *    - TypeScript infers all types correctly
 *    - No loss of type information when merging
 * 
 * 5. ✅ Easy Testing
 *    - Test individual API modules independently
 *    - Mock specific queries/mutations easily
 * 
 * 6. ✅ Code Organization
 *    - Keep related queries and mutations together
 *    - Easy to add new endpoints without cluttering main file
 */
