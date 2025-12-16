/**
 * Modular User API Definitions
 * This file demonstrates how to define user-related queries and mutations in a separate module
 */

import { z } from '../../../dist';

// User schemas
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export const UserListSchema = z.array(UserSchema);

// Define user queries separately
export const userQueries = {
  getUsers: {
    method: 'GET' as const,
    path: '/users',
    params: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional(),
    response: UserListSchema,
  },

  getUser: {
    method: 'GET' as const,
    path: '/users/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: UserSchema,
  },

  // POST query for searching users
  searchUsers: {
    method: 'POST' as const,
    path: '/users/1', // Demo endpoint
    data: z.object({
      query: z.string().optional(),
      email: z.string().email().optional(),
    }),
    response: UserSchema,
  },
};

// Define user mutations separately
export const userMutations = {
  createUser: {
    method: 'POST' as const,
    path: '/users',
    data: z.object({
      name: z.string(),
      username: z.string(),
      email: z.string().email(),
    }),
    response: UserSchema,
  },

  updateUser: {
    method: 'PUT' as const,
    path: '/users/{id}',
    params: z.object({
      id: z.number(),
    }),
    data: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    }),
    response: UserSchema,
  },

  deleteUser: {
    method: 'DELETE' as const,
    path: '/users/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: z.object({}),
  },
};

// Export types for use in components
export type User = z.infer<typeof UserSchema>;
