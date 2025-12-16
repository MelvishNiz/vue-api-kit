/**
 * Modular User API Definitions
 * This file demonstrates how to define user-related queries and mutations in a separate module
 */

import { z, defineQuery, defineMutation } from '../../../dist';

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
  getUsers: defineQuery({
    method: 'GET',
    path: '/users',
    params: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
    }).optional(),
    response: UserListSchema,
  }),

  getUser: defineQuery({
    method: 'GET',
    path: '/users/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: UserSchema,
  }),

  // POST query for searching users
  searchUsers: defineQuery({
    method: 'POST',
    path: '/users/1', // Demo endpoint
    data: z.object({
      query: z.string().optional(),
      email: z.string().email().optional(),
    }),
    response: UserSchema,
  }),
};

// Define user mutations separately
export const userMutations = {
  createUser: defineMutation({
    method: 'POST',
    path: '/users',
    data: z.object({
      name: z.string(),
      username: z.string(),
      email: z.string().email(),
    }),
    response: UserSchema,
  }),

  updateUser: defineMutation({
    method: 'PUT',
    path: '/users/{id}',
    params: z.object({
      id: z.number(),
    }),
    data: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    }),
    response: UserSchema,
  }),

  deleteUser: defineMutation({
    method: 'DELETE',
    path: '/users/{id}',
    params: z.object({
      id: z.number(),
    }),
    response: z.object({}),
  }),
};

// Export types for use in components
export type User = z.infer<typeof UserSchema>;
