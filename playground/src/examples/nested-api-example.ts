/**
 * Nested Structure API Example
 * This file demonstrates how to use the new multi-level nested structure feature
 * to organize API endpoints in a hierarchical manner
 */

import { createApiClient, defineQuery, defineMutation } from '../../../dist';
import { z } from 'zod';

// Schema definitions
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
});

const PostSchema = z.object({
  id: z.number(),
  userId: z.number(),
  title: z.string(),
  body: z.string(),
});

const CommentSchema = z.object({
  id: z.number(),
  postId: z.number(),
  name: z.string(),
  email: z.string().email(),
  body: z.string(),
});

// Create API client with nested structure
export const nestedApi = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  
  // Nested query structure
  queries: {
    // Users resource
    users: {
      getAll: defineQuery({
        method: 'GET',
        path: '/users',
        response: z.array(UserSchema),
      }),
      getById: defineQuery({
        method: 'GET',
        path: '/users/{id}',
        params: z.object({ id: z.number() }),
        response: UserSchema,
      }),
      search: defineQuery({
        method: 'POST',
        path: '/users/1', // Demo endpoint (using single user as search example)
        data: z.object({
          query: z.string().optional(),
          email: z.string().email().optional(),
        }),
        response: UserSchema,
      }),
    },
    
    // Posts resource
    posts: {
      getAll: defineQuery({
        method: 'GET',
        path: '/posts',
        response: z.array(PostSchema),
      }),
      getById: defineQuery({
        method: 'GET',
        path: '/posts/{id}',
        params: z.object({ id: z.number() }),
        response: PostSchema,
      }),
      getByUser: defineQuery({
        method: 'GET',
        path: '/users/{userId}/posts',
        params: z.object({ userId: z.number() }),
        response: z.array(PostSchema),
      }),
    },
    
    // Comments resource
    comments: {
      getAll: defineQuery({
        method: 'GET',
        path: '/comments',
        response: z.array(CommentSchema),
      }),
      getByPost: defineQuery({
        method: 'GET',
        path: '/posts/{postId}/comments',
        params: z.object({ postId: z.number() }),
        response: z.array(CommentSchema),
      }),
    },
  },
  
  // Nested mutation structure
  mutations: {
    users: {
      create: defineMutation({
        method: 'POST',
        path: '/users',
        data: z.object({
          name: z.string(),
          username: z.string(),
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
    
    posts: {
      create: defineMutation({
        method: 'POST',
        path: '/posts',
        data: z.object({
          userId: z.number(),
          title: z.string(),
          body: z.string(),
        }),
        response: PostSchema,
      }),
      update: defineMutation({
        method: 'PUT',
        path: '/posts/{id}',
        params: z.object({ id: z.number() }),
        data: z.object({
          title: z.string().optional(),
          body: z.string().optional(),
        }),
        response: PostSchema,
      }),
      delete: defineMutation({
        method: 'DELETE',
        path: '/posts/{id}',
        params: z.object({ id: z.number() }),
      }),
    },
    
    comments: {
      create: defineMutation({
        method: 'POST',
        path: '/comments',
        data: z.object({
          postId: z.number(),
          name: z.string(),
          email: z.string().email(),
          body: z.string(),
        }),
        response: CommentSchema,
      }),
    },
  },
  
  // Global error handler
  onErrorRequest: ({ message, status }) => {
    console.error(`[Nested API Error] ${status}: ${message}`);
  },
});

// Example: Deep nesting for versioned API
export const deepNestedApi = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  
  queries: {
    api: {
      v1: {
        resources: {
          users: {
            list: defineQuery({
              path: '/users',
              response: z.array(UserSchema),
            }),
            get: defineQuery({
              path: '/users/{id}',
              params: z.object({ id: z.number() }),
              response: UserSchema,
            }),
          },
          posts: {
            list: defineQuery({
              path: '/posts',
              response: z.array(PostSchema),
            }),
          },
        },
      },
    },
  },
});

// Export types for use in components
export type User = z.infer<typeof UserSchema>;
export type Post = z.infer<typeof PostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
