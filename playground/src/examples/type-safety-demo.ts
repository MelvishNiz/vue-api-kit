/**
 * Type Safety Demonstration
 * 
 * This file demonstrates the fully-typed nested structure implementation.
 * Open this file in your IDE to see TypeScript autocomplete and type checking in action!
 */

import { createApiClient, defineQuery, defineMutation } from '../../../dist';
import { z } from 'zod';

// Create a fully-typed nested API client
const api = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  
  queries: {
    // Nested structure for users
    users: {
      getAll: defineQuery({
        method: 'GET',
        path: '/users',
        response: z.array(z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().email(),
        }))
      }),
      getById: defineQuery({
        method: 'GET',
        path: '/users/{id}',
        params: z.object({ id: z.number() }),
        response: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().email(),
        })
      }),
    },
    
    // Nested structure for posts
    posts: {
      getAll: defineQuery({
        method: 'GET',
        path: '/posts',
        response: z.array(z.object({
          id: z.number(),
          title: z.string(),
          body: z.string(),
        }))
      }),
      getByUser: defineQuery({
        method: 'GET',
        path: '/users/{userId}/posts',
        params: z.object({ userId: z.number() }),
        response: z.array(z.object({
          id: z.number(),
          title: z.string(),
          body: z.string(),
        }))
      }),
    },
    
    // Deep nesting example
    api: {
      v1: {
        admin: {
          reports: {
            daily: defineQuery({
              path: '/api/v1/admin/reports/daily',
              response: z.object({
                date: z.string(),
                stats: z.object({
                  users: z.number(),
                  posts: z.number(),
                })
              })
            })
          }
        }
      }
    }
  },
  
  mutations: {
    // Nested structure for user mutations
    users: {
      create: defineMutation({
        method: 'POST',
        path: '/users',
        data: z.object({
          name: z.string(),
          email: z.string().email(),
        }),
        response: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().email(),
        })
      }),
      update: defineMutation({
        method: 'PUT',
        path: '/users/{id}',
        params: z.object({ id: z.number() }),
        data: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
        }),
        response: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string().email(),
        })
      }),
    },
    
    // Nested structure for post mutations
    posts: {
      create: defineMutation({
        method: 'POST',
        path: '/posts',
        data: z.object({
          userId: z.number(),
          title: z.string(),
          body: z.string(),
        }),
        response: z.object({
          id: z.number(),
          userId: z.number(),
          title: z.string(),
          body: z.string(),
        })
      }),
    }
  }
});

/**
 * FULLY TYPED! Try these in your IDE:
 * 
 * 1. Type api.query. and see autocomplete showing:
 *    - users
 *    - posts
 *    - api
 * 
 * 2. Type api.query.users. and see:
 *    - getAll
 *    - getById
 * 
 * 3. Type api.query.api.v1.admin.reports. and see:
 *    - daily
 * 
 * 4. Use the hooks and see full type inference:
 */

// ✅ Fully typed query hooks
export function demonstrateTypedQueries() {
  // TypeScript knows this returns QueryResult<Array<{ id: number, name: string, email: string }>>
  const { result: users } = api.query.users.getAll();
  
  // TypeScript knows this requires params: { id: number }
  const { result: user } = api.query.users.getById({
    params: { id: 1 }  // ✅ Type-checked!
  });
  
  // TypeScript knows this returns QueryResult<Array<{ id: number, title: string, body: string }>>
  const { result: posts } = api.query.posts.getAll();
  
  // Deep nesting is fully typed too!
  const { result: report } = api.query.api.v1.admin.reports.daily();
  
  // ✅ All of these have proper TypeScript types!
  // Try hovering over `users`, `user`, `posts`, or `report` in your IDE
  
  return { users, user, posts, report };
}

// ✅ Fully typed mutation hooks
export function demonstrateTypedMutations() {
  // TypeScript knows the data shape and response type
  const { mutate: createUser } = api.mutation.users.create();
  
  // This is fully type-checked:
  createUser({
    data: {
      name: "John Doe",
      email: "john@example.com"
    }
  });
  
  // TypeScript will error if you try:
  // createUser({ data: { name: 123 } });  // ❌ Type error: name must be string
  // createUser({ data: { email: "invalid" } });  // ❌ Type error: email must be valid email
  
  // Update mutation with params
  const { mutate: updateUser } = api.mutation.users.update();
  
  updateUser({
    params: { id: 1 },  // ✅ Type-checked!
    data: {
      name: "Jane Doe"  // ✅ Optional fields work!
    }
  });
  
  return { createUser, updateUser };
}

/**
 * NO MORE `any` TYPES!
 * 
 * Before:
 * - createApiClient<Q extends Record<string, any>, M extends Record<string, any>>
 * - function createQueryHooks(queriesDef: Record<string, any>): any
 * 
 * After:
 * - createApiClient<Q extends Record<string, NestedStructure<ApiQuery>>, M extends Record<string, NestedStructure<ApiMutation>>>
 * - function createQueryHooks<T extends Record<string, NestedStructure<ApiQuery>>>(queriesDef: T): QueryHooksFromDefinitions<T>
 * 
 * Full type inference with zero runtime cost! 🎉
 */
