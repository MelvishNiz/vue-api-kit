/**
 * Example: Using onBeforeRequest to modify headers
 * This demonstrates how to use onBeforeRequest at different levels:
 * 1. Definition level (in defineQuery/defineMutation)
 * 2. Runtime level (when calling the query/mutation)
 * 3. Global level (in createApiClient - see merged-api-example.ts)
 */

import { z, defineQuery, defineMutation } from '../../../dist';

// Schemas
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  userId: z.number(),
});

/* ============================================================================
 * DEFINITION-LEVEL onBeforeRequest
 * ============================================================================
 * Use this when you want to modify headers for ALL calls to this specific
 * query or mutation. Perfect for endpoints that require special headers.
 */

export const queriesWithOnBeforeRequest = {
  // Example 1: Add authentication header for a specific query
  getProtectedUser: defineQuery({
    method: 'GET',
    path: '/users/{id}',
    params: z.object({ id: z.number() }),
    response: UserSchema,
    // This will be called before every request to this endpoint
    onBeforeRequest: async (config) => {
      // Add custom header
      config.headers['X-Custom-Auth'] = 'Bearer special-token';
      // You can also modify other config properties
      config.timeout = 5000;
      return config;
    },
  }),

  // Example 2: Add API key for a specific search endpoint
  searchUsers: defineQuery({
    method: 'POST',
    path: '/users/search',
    data: z.object({
      query: z.string(),
    }),
    response: z.array(UserSchema),
    onBeforeRequest: (config) => {
      // Add API key header
      config.headers['X-API-Key'] = 'your-api-key-here';
      return config;
    },
  }),

  // Example 3: Async onBeforeRequest - fetch fresh token
  getUserWithFreshToken: defineQuery({
    method: 'GET',
    path: '/users/{id}',
    params: z.object({ id: z.number() }),
    response: UserSchema,
    onBeforeRequest: async (config) => {
      // Simulate fetching fresh token from storage or refreshing it
      const token = await fetchFreshToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
  }),
};

export const mutationsWithOnBeforeRequest = {
  // Example 1: Add special header for creating posts
  createPost: defineMutation({
    method: 'POST',
    path: '/posts',
    data: z.object({
      title: z.string(),
      body: z.string(),
      userId: z.number(),
    }),
    response: PostSchema,
    onBeforeRequest: (config) => {
      // Add content versioning header
      config.headers['X-Content-Version'] = '2.0';
      return config;
    },
  }),

  // Example 2: Add timestamp header for updates
  updatePost: defineMutation({
    method: 'PUT',
    path: '/posts/{id}',
    params: z.object({ id: z.number() }),
    data: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
    }),
    response: PostSchema,
    onBeforeRequest: (config) => {
      // Add timestamp
      config.headers['X-Updated-At'] = new Date().toISOString();
      return config;
    },
  }),

  // Example 3: Add request ID for tracking
  deletePost: defineMutation({
    method: 'DELETE',
    path: '/posts/{id}',
    params: z.object({ id: z.number() }),
    response: z.object({ success: z.boolean() }),
    onBeforeRequest: (config) => {
      // Add unique request ID for tracking
      config.headers['X-Request-ID'] = generateRequestId();
      return config;
    },
  }),
};

/* ============================================================================
 * USAGE IN COMPONENTS - RUNTIME-LEVEL onBeforeRequest
 * ============================================================================
 * Use this when you want to modify headers for a specific call.
 * This is useful when the header value depends on component state.
 */

/**
 * Example usage in a Vue component:
 *
 * <script setup lang="ts">
 * import { createApiClient } from 'vue-api-kit';
 * import { queriesWithOnBeforeRequest } from './examples/onBeforeRequest-example';
 *
 * const api = createApiClient({
 *   baseURL: 'https://jsonplaceholder.typicode.com',
 *   queries: queriesWithOnBeforeRequest,
 * });
 *
 * // Example 1: Use query with definition-level onBeforeRequest
 * // The header defined in the query definition will be added automatically
 * const { result, isLoading } = api.query.getProtectedUser({
 *   params: { id: 1 }
 * });
 *
 * // Example 2: Override or add additional headers at runtime
 * const userId = ref(1);
 * const userToken = ref('user-specific-token');
 *
 * const { result: user } = api.query.getProtectedUser({
 *   params: { id: userId },
 *   onBeforeRequest: async (config) => {
 *     // This runs AFTER the definition-level onBeforeRequest
 *     // You can override or add more headers
 *     config.headers.Authorization = `Bearer ${userToken.value}`;
 *     config.headers['X-User-Context'] = userId.value.toString();
 *     return config;
 *   }
 * });
 *
 * // Example 3: Dynamic headers in mutations
 * const { mutate } = api.mutation.createPost({
 *   onBeforeRequest: (config) => {
 *     // Add runtime-specific headers
 *     const sessionId = 'session_' + Math.random().toString(36).slice(2, 11);
 *     config.headers['X-Session-ID'] = sessionId;
 *     return config;
 *   }
 * });
 *
 * await mutate({
 *   data: {
 *     title: 'My Post',
 *     body: 'Post content',
 *     userId: 1
 *   }
 * });
 * </script>
 */

/* ============================================================================
 * EXECUTION ORDER
 * ============================================================================
 * When multiple onBeforeRequest hooks are defined, they execute in this order:
 * 1. Global onBeforeRequest (defined in createApiClient)
 * 2. Definition-level onBeforeRequest (defined in defineQuery/defineMutation)
 * 3. Runtime-level onBeforeRequest (defined in query/mutation options)
 *
 * Each hook receives the config modified by the previous hook.
 */

/* ============================================================================
 * HELPER FUNCTIONS (for demonstration)
 * ============================================================================ */

async function fetchFreshToken(): Promise<string> {
  // In a real app, this would fetch from localStorage, refresh if expired, etc.
  return 'fresh-token-123';
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/* ============================================================================
 * COMMON USE CASES
 * ============================================================================
 *
 * 1. Authentication:
 *    - Add Bearer tokens
 *    - Refresh tokens before request
 *    - Add API keys
 *
 * 2. Request Tracking:
 *    - Add request IDs
 *    - Add correlation IDs
 *    - Add trace IDs
 *
 * 3. Content Negotiation:
 *    - Set Accept-Language header
 *    - Set Content-Type variations
 *    - Set API version headers
 *
 * 4. Debugging:
 *    - Add debug flags
 *    - Add feature flags
 *    - Add environment identifiers
 *
 * 5. Security:
 *    - Add CSRF tokens
 *    - Add signature headers
 *    - Add timestamp headers
 */

export type User = z.infer<typeof UserSchema>;
export type Post = z.infer<typeof PostSchema>;
