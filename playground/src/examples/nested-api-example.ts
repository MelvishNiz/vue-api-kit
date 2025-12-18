/**
 * Example: Nested API Structure
 * 
 * This example demonstrates how to organize API endpoints using nested structure
 * for better organization and maintainability.
 */

import { createApiClient, z, defineQuery, defineMutation } from '../../../dist';

// Define schemas
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

// Create API client with nested structure
export const api = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  
  // Nested queries - organized by domain
  queries: {
    // Authentication queries
    auth: {
      me: defineQuery({
        method: 'GET',
        path: '/users/1',  // Using a demo endpoint
        response: UserSchema,
      }),
      profile: defineQuery({
        method: 'GET',
        path: '/users/1',  // Using a demo endpoint
        response: UserSchema,
      }),
    },
    
    // User management queries
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
    },
    
    // You can also have flat endpoints alongside nested ones
    getStatus: defineQuery({
      method: 'GET',
      path: '/posts/1',  // Using as a demo endpoint
      response: z.object({
        userId: z.number(),
        id: z.number(),
        title: z.string(),
        body: z.string(),
      }),
    }),
  },
  
  // Nested mutations - organized by domain
  mutations: {
    // Authentication mutations
    auth: {
      login: defineMutation({
        method: 'POST',
        path: '/posts',  // Using as a demo endpoint
        data: LoginSchema,
        response: TokenSchema,
      }),
      logout: defineMutation({
        method: 'POST',
        path: '/posts',  // Using as a demo endpoint
      }),
    },
    
    // User management mutations
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
  },
});

// Usage examples:

// 1. Using nested queries
// const { result: currentUser, isLoading } = api.query.auth.me();
// const { result: users } = api.query.users.list();
// const { result: user } = api.query.users.get({ params: { id: 1 } });

// 2. Using flat queries (still supported)
// const { result: status } = api.query.getStatus();

// 3. Using nested mutations
// const { mutate: login, isLoading: isLoggingIn } = api.mutation.auth.login();
// await login({ data: { email: 'test@example.com', password: 'password' } });

// const { mutate: createUser } = api.mutation.users.create();
// await createUser({ data: { name: 'John', email: 'john@example.com' } });

// 4. Benefits of nested structure:
// - Better organization: Group related endpoints together
// - Easier to navigate: auth.login is more intuitive than authLogin
// - Scales better: Deep nesting support for complex APIs
// - Backward compatible: Flat structure still works
