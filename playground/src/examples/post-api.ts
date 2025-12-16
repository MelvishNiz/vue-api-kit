/**
 * Modular Post API Definitions
 * This file demonstrates how to define post-related queries and mutations in a separate module
 */

import { z, defineQuery, defineMutation } from '../../../dist';

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
  getPosts: defineQuery({
    method: 'GET',
    path: '/posts',
    params: z.object({
      userId: z.number().optional(),
    }).optional(),
    response: PostListSchema,
  }),
  
  getPost: defineQuery({
    method: 'GET',
    path: '/posts/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: PostSchema,
  }),
  
  getPostComments: defineQuery({
    method: 'GET',
    path: '/posts/{postId}/comments',
    params: z.object({
      postId: z.number(),
    }),
    response: CommentListSchema,
  }),
  
  // POST query for searching posts
  searchPosts: defineQuery({
    method: 'POST',
    path: '/posts/1', // Demo endpoint
    data: z.object({
      title: z.string().optional(),
      body: z.string().optional(),
      userId: z.number().optional(),
    }),
    response: PostSchema,
  }),
};

// Define post mutations separately
export const postMutations = {
  createPost: defineMutation({
    method: 'POST',
    path: '/posts',
    data: z.object({
      title: z.string(),
      body: z.string(),
      userId: z.number(),
    }),
    response: PostSchema,
  }),
  
  updatePost: defineMutation({
    method: 'PUT',
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
  }),
  
  deletePost: defineMutation({
    method: 'DELETE',
    path: '/posts/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: z.object({}),
  }),
};

// Export types for use in components
export type Post = z.infer<typeof PostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
