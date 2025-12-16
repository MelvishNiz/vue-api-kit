/**
 * Modular Post API Definitions
 * This file demonstrates how to define post-related queries and mutations in a separate module
 */

import { z } from '../../../dist';

// Post schemas
export const PostSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

export const PostListSchema = z.array(PostSchema);

export const CommentSchema = z.object({
  postId: z.number(),
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  body: z.string(),
});

export const CommentListSchema = z.array(CommentSchema);

// Define post queries separately
export const postQueries = {
  getPosts: {
    method: 'GET' as const,
    path: '/posts',
    params: z.object({
      userId: z.number().optional(),
    }).optional(),
    response: PostListSchema,
  },
  
  getPost: {
    method: 'GET' as const,
    path: '/posts/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: PostSchema,
  },
  
  getPostComments: {
    method: 'GET' as const,
    path: '/posts/{postId}/comments',
    params: z.object({
      postId: z.number(),
    }),
    response: CommentListSchema,
  },
  
  // POST query for searching posts
  searchPosts: {
    method: 'POST' as const,
    path: '/posts/1', // Demo endpoint
    data: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
      userId: z.number().optional(),
    }),
    response: PostSchema,
  },
};

// Define post mutations separately
export const postMutations = {
  createPost: {
    method: 'POST' as const,
    path: '/posts',
    data: z.object({
      title: z.string(),
      body: z.string(),
      userId: z.number(),
    }),
    response: PostSchema,
  },
  
  updatePost: {
    method: 'PUT' as const,
    path: '/posts/{id}',
    params: z.object({
      id: z.number(),
    }),
    data: z.object({
      title: z.string(),
      body: z.string(),
      userId: z.number(),
    }),
    response: PostSchema,
  },
  
  deletePost: {
    method: 'DELETE' as const,
    path: '/posts/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: z.object({}),
  },
};

// Export types for use in components
export type Post = z.infer<typeof PostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
