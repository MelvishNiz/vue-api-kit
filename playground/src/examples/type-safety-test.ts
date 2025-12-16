/**
 * Type Safety Test for Merge Utilities
 * 
 * This file demonstrates and validates that the merge utilities maintain
 * full type safety throughout the merging process.
 */

import { createApiClient, mergeQueries, mergeMutations, mergeApiDefinitions, z } from '../../../dist';

// ============================================================================
// Define separate API modules
// ============================================================================

// User API definitions
const userQueries = {
  getUsers: {
    method: 'GET' as const,
    path: '/users',
    response: z.array(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    }))
  },
  getUser: {
    method: 'GET' as const,
    path: '/users/{id}',
    params: z.object({ id: z.number() }),
    response: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    })
  }
} as const;

const userMutations = {
  createUser: {
    method: 'POST' as const,
    path: '/users',
    data: z.object({
      name: z.string(),
      email: z.string().email()
    }),
    response: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    })
  }
} as const;

// Post API definitions
const postQueries = {
  getPosts: {
    method: 'GET' as const,
    path: '/posts',
    response: z.array(z.object({
      id: z.number(),
      title: z.string(),
      body: z.string()
    }))
  }
} as const;

const postMutations = {
  createPost: {
    method: 'POST' as const,
    path: '/posts',
    data: z.object({
      title: z.string(),
      body: z.string()
    }),
    response: z.object({
      id: z.number(),
      title: z.string(),
      body: z.string()
    })
  }
} as const;

// ============================================================================
// Test Type 1: mergeQueries maintains types
// ============================================================================

const allQueries = mergeQueries(userQueries, postQueries);

// Type assertions - these should pass TypeScript compilation
type HasGetUsers = typeof allQueries extends { getUsers: any } ? true : false;
type HasGetUser = typeof allQueries extends { getUser: any } ? true : false;
type HasGetPosts = typeof allQueries extends { getPosts: any } ? true : false;

const _typeCheck1: HasGetUsers = true;
const _typeCheck2: HasGetUser = true;
const _typeCheck3: HasGetPosts = true;

// ============================================================================
// Test Type 2: mergeMutations maintains types
// ============================================================================

const allMutations = mergeMutations(userMutations, postMutations);

// Type assertions
type HasCreateUser = typeof allMutations extends { createUser: any } ? true : false;
type HasCreatePost = typeof allMutations extends { createPost: any } ? true : false;

const _typeCheck4: HasCreateUser = true;
const _typeCheck5: HasCreatePost = true;

// ============================================================================
// Test Type 3: mergeApiDefinitions maintains full type structure
// ============================================================================

const baseConfig = {
  baseURL: 'https://api.example.com' as const,
};

const userApiConfig = {
  queries: userQueries,
  mutations: userMutations,
};

const postApiConfig = {
  queries: postQueries,
  mutations: postMutations,
};

const mergedConfig = mergeApiDefinitions(baseConfig, userApiConfig, postApiConfig);

// Type assertions for merged config
type HasBaseURL = typeof mergedConfig extends { baseURL: string } ? true : false;
type HasQueries = typeof mergedConfig extends { queries: any } ? true : false;
type HasMutations = typeof mergedConfig extends { mutations: any } ? true : false;

const _typeCheck6: HasBaseURL = true;
const _typeCheck7: HasQueries = true;
const _typeCheck8: HasMutations = true;

// ============================================================================
// Test Type 4: createApiClient with merged definitions works correctly
// ============================================================================

const api = createApiClient({
  baseURL: 'https://api.example.com',
  queries: allQueries,
  mutations: allMutations,
});

// Type check: api should have query property with all merged queries
type ApiHasQueryGetUsers = typeof api extends { query: { getUsers: any } } ? true : false;
type ApiHasQueryGetUser = typeof api extends { query: { getUser: any } } ? true : false;
type ApiHasQueryGetPosts = typeof api extends { query: { getPosts: any } } ? true : false;

const _typeCheck9: ApiHasQueryGetUsers = true;
const _typeCheck10: ApiHasQueryGetUser = true;
const _typeCheck11: ApiHasQueryGetPosts = true;

// Type check: api should have mutation property with all merged mutations
type ApiHasMutationCreateUser = typeof api extends { mutation: { createUser: any } } ? true : false;
type ApiHasMutationCreatePost = typeof api extends { mutation: { createPost: any } } ? true : false;

const _typeCheck12: ApiHasMutationCreateUser = true;
const _typeCheck13: ApiHasMutationCreatePost = true;

// ============================================================================
// Test Type 5: API usage maintains proper parameter and response types
// ============================================================================

// This function demonstrates that type inference works end-to-end
export function typeInferenceDemo() {
  // Query usage - parameters are typed
  const { result: users } = api.query.getUsers();
  
  // users should be typed as Ref<Array<{ id: number; name: string; email: string }> | undefined>
  if (users.value) {
    // These should be valid property accesses
    const id: number = users.value[0]?.id ?? 0;
    const name: string = users.value[0]?.name ?? '';
    const email: string = users.value[0]?.email ?? '';
    
    console.log(id, name, email);
    
    // @ts-expect-error - This should be a TypeScript error (invalid property)
    const invalidProp = users.value[0]?.nonexistent;
    console.log(invalidProp);
  }
  
  // Query with params - params are typed
  const { result: user } = api.query.getUser({
    params: { id: 1 } // ✓ This should work
  });
  
  // @ts-expect-error - This should be a TypeScript error (wrong param type)
  const { result: invalidUser } = api.query.getUser({
    params: { id: "1" } // ✗ Should be number, not string
  });
  console.log(invalidUser);
  
  // Mutation usage - data is typed
  const { mutate: createUser } = api.mutation.createUser();
  
  createUser({
    data: {
      name: 'John Doe',
      email: 'john@example.com'
    } // ✓ This should work
  });
  
  // @ts-expect-error - This should be a TypeScript error (missing required field)
  createUser({
    data: {
      name: 'John Doe'
      // email is missing
    }
  });
  
  // @ts-expect-error - This should be a TypeScript error (invalid field)
  createUser({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      invalidField: 'value'
    }
  });
  
  if (user.value) {
    console.log(user.value.name); // ✓ Valid
    // @ts-expect-error - Invalid property access
    console.log(user.value.invalidProp);
  }
}

// ============================================================================
// SUCCESS: If this file compiles without errors (ignoring @ts-expect-error),
// it means the merge utilities maintain full type safety!
// ============================================================================

console.log('✅ Type safety test passed! All merge utilities maintain proper types.');
