/**
 * Example: Modular Nested API Definitions
 * 
 * This example shows how to organize nested API definitions across multiple files
 * and merge them together for better code organization.
 */

import { z, defineQuery, defineMutation } from '../../../dist';

// ============================================================================
// Auth Module - Separate file: auth-api.ts
// ============================================================================

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const TokenSchema = z.object({
  token: z.string(),
});

export const authQueries = {
  auth: {
    me: defineQuery({
      method: 'GET',
      path: '/users/1',  // Demo endpoint
      response: UserSchema,
    }),
    profile: defineQuery({
      method: 'GET',
      path: '/users/1',  // Demo endpoint
      response: UserSchema,
    }),
  },
};

export const authMutations = {
  auth: {
    login: defineMutation({
      method: 'POST',
      path: '/posts',  // Demo endpoint
      data: LoginSchema,
      response: TokenSchema,
    }),
    logout: defineMutation({
      method: 'POST',
      path: '/posts',  // Demo endpoint
    }),
    register: defineMutation({
      method: 'POST',
      path: '/users',
      data: z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(8),
      }),
      response: UserSchema,
    }),
  },
};

// ============================================================================
// Users Module - Separate file: users-api.ts
// ============================================================================

export const usersQueries = {
  users: {
    list: defineQuery({
      method: 'GET',
      path: '/users',
      response: z.array(UserSchema),
    }),
    get: defineQuery({
      method: 'GET',
      path: '/users/{id}',
      params: z.object({ id: z.number() }),
      response: UserSchema,
    }),
    search: defineQuery({
      method: 'POST',
      path: '/users/1',  // Demo endpoint
      data: z.object({
        query: z.string(),
      }),
      response: z.array(UserSchema),
    }),
  },
};

export const usersMutations = {
  users: {
    create: defineMutation({
      method: 'POST',
      path: '/users',
      data: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      response: UserSchema,
    }),
    update: defineMutation({
      method: 'PUT',
      path: '/users/{id}',
      params: z.object({ id: z.number() }),
      data: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      }),
      response: UserSchema,
    }),
    delete: defineMutation({
      method: 'DELETE',
      path: '/users/{id}',
      params: z.object({ id: z.number() }),
    }),
  },
};

// ============================================================================
// Posts Module - Separate file: posts-api.ts
// ============================================================================

const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  userId: z.number(),
});

export const postsQueries = {
  posts: {
    list: defineQuery({
      method: 'GET',
      path: '/posts',
      response: z.array(PostSchema),
    }),
    get: defineQuery({
      method: 'GET',
      path: '/posts/{id}',
      params: z.object({ id: z.number() }),
      response: PostSchema,
    }),
  },
};

export const postsMutations = {
  posts: {
    create: defineMutation({
      method: 'POST',
      path: '/posts',
      data: z.object({
        title: z.string(),
        body: z.string(),
        userId: z.number(),
      }),
      response: PostSchema,
    }),
  },
};

// ============================================================================
// Main API Client - File: api-client.ts
// ============================================================================

import { createApiClient, mergeQueries, mergeMutations } from '../../../dist';

// Merge all queries and mutations from different modules
export const api = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  
  // Merge nested queries from multiple modules
  queries: mergeQueries(
    authQueries,
    usersQueries,
    postsQueries
  ),
  
  // Merge nested mutations from multiple modules
  mutations: mergeMutations(
    authMutations,
    usersMutations,
    postsMutations
  ),
});

// Now you can use the API with nested structure:
// api.query.auth.me()
// api.query.auth.profile()
// api.query.users.list()
// api.query.users.get({ params: { id: 1 } })
// api.query.posts.list()
// api.mutation.auth.login({ data: { email: '...', password: '...' } })
// api.mutation.users.create({ data: { name: '...', email: '...' } })
// api.mutation.posts.create({ data: { title: '...', body: '...', userId: 1 } })

// Benefits:
// 1. ✅ Organized by domain/module (auth, users, posts)
// 2. ✅ Each module can be in a separate file
// 3. ✅ Easy to maintain and scale
// 4. ✅ Full type safety with TypeScript
// 5. ✅ Team members can work on different modules independently
// 6. ✅ Clean and intuitive API: api.mutation.auth.login() vs api.mutation.authLogin()
