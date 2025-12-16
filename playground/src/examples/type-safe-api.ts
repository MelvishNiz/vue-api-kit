/**
 * This file demonstrates the full type safety and modularity of queries and mutations
 * with POST support in vue-api-kit
 */

import { createApiClient, z } from '../../../dist';

// ============================================================================
// MODULAR API DEFINITIONS - Define schemas separately for reusability
// ============================================================================

// User schemas
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'moderator']),
});

const UserListSchema = z.array(UserSchema);

// Search schemas
const UserSearchParamsSchema = z.object({
  query: z.string().min(1),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
  active: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
});

const UserSearchResponseSchema = z.object({
  users: UserListSchema,
  total: z.number(),
  page: z.number(),
});

// Create/Update schemas
const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user', 'moderator']),
});

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user', 'moderator']).optional(),
});

// ============================================================================
// TYPE-SAFE API CLIENT
// ============================================================================

export const api = createApiClient({
  baseURL: 'https://api.example.com',
  
  queries: {
    // GET query - Traditional approach
    getUsers: {
      method: 'GET',
      path: '/users',
      params: z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
      }),
      response: UserListSchema,
    },

    // GET query with path parameter
    getUser: {
      method: 'GET',
      path: '/users/{id}',
      params: z.object({
        id: z.number(),
      }),
      response: UserSchema,
    },

    // POST query - New feature for complex searches
    searchUsers: {
      method: 'POST',
      path: '/users/search',
      data: UserSearchParamsSchema,
      response: UserSearchResponseSchema,
    },

    // POST query with both params and data
    searchUsersByRole: {
      method: 'POST',
      path: '/roles/{roleId}/users/search',
      params: z.object({
        roleId: z.string(),
      }),
      data: z.object({
        query: z.string(),
        includeInactive: z.boolean().optional(),
      }),
      response: UserSearchResponseSchema,
    },
  },

  mutations: {
    // POST mutation - Create
    createUser: {
      method: 'POST',
      path: '/users',
      data: CreateUserSchema,
      response: UserSchema,
    },

    // PUT mutation - Update
    updateUser: {
      method: 'PUT',
      path: '/users/{id}',
      params: z.object({
        id: z.number(),
      }),
      data: UpdateUserSchema,
      response: UserSchema,
    },

    // DELETE mutation
    deleteUser: {
      method: 'DELETE',
      path: '/users/{id}',
      params: z.object({
        id: z.number(),
      }),
      response: z.object({
        success: z.boolean(),
      }),
    },

    // POST mutation with file upload
    uploadUserAvatar: {
      method: 'POST',
      path: '/users/{id}/avatar',
      params: z.object({
        id: z.number(),
      }),
      isMultipart: true,
      response: z.object({
        avatarUrl: z.string().url(),
      }),
    },
  },
});

// ============================================================================
// USAGE EXAMPLES WITH FULL TYPE INFERENCE
// ============================================================================

/**
 * Example 1: GET Query - Types are automatically inferred
 */
export function useGetUsersExample() {
  const { result, isLoading, errorMessage, refetch } = api.query.getUsers({
    params: {
      page: 1,
      limit: 10,
    },
  });
  
  // result is typed as: Ref<Array<{ id: number; name: string; email: string; role: 'admin' | 'user' | 'moderator' }> | undefined>
  // Full intellisense and type checking available!
  
  return { result, isLoading, errorMessage, refetch };
}

/**
 * Example 2: POST Query - Search with complex data
 */
export function useSearchUsersExample() {
  const { result, isLoading, errorMessage, refetch } = api.query.searchUsers({
    data: {
      query: 'john',
      role: 'admin',
      active: true,
      limit: 20,
    },
    loadOnMount: false,
  });
  
  // result is typed as: Ref<{ users: User[]; total: number; page: number } | undefined>
  // All properties are fully typed and validated with Zod!
  
  return { result, isLoading, errorMessage, refetch };
}

/**
 * Example 3: POST Query with reactive data binding (perfect for forms)
 */
export function useReactiveSearchExample(searchForm: {
  query: string;
  role?: 'admin' | 'user' | 'moderator';
  active?: boolean;
}) {
  const { result, isLoading, refetch } = api.query.searchUsers({
    data: searchForm,
    debounce: 300, // Debounce for 300ms
    onResult: (data) => {
      console.log(`Found ${data.total} users`);
    },
  });
  
  // The query will automatically re-run when searchForm changes
  // Types ensure searchForm matches UserSearchParamsSchema
  
  return { result, isLoading, refetch };
}

/**
 * Example 4: POST Mutation - Create user
 */
export function useCreateUserExample() {
  const { mutate, isLoading, result, errorMessage } = api.mutation.createUser({
    onResult: (user) => {
      console.log('User created:', user.id);
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
  
  const handleSubmit = async (formData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user' | 'moderator';
  }) => {
    await mutate({ data: formData });
    // formData is validated against CreateUserSchema
    // TypeScript ensures all required fields are present
  };
  
  return { mutate, isLoading, result, errorMessage, handleSubmit };
}

/**
 * Example 5: Mutation with file upload
 */
export function useUploadAvatarExample() {
  const { mutate, uploadProgress, isLoading } = api.mutation.uploadUserAvatar({
    onUploadProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`);
    },
  });
  
  const handleUpload = async (userId: number, file: File) => {
    await mutate({
      params: { id: userId },
      data: { avatar: file },
    });
  };
  
  return { mutate, uploadProgress, isLoading, handleUpload };
}

// ============================================================================
// TYPE EXTRACTION - Get types from API definition
// ============================================================================

// Extract types from Zod schemas for use in your application
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserSearchParams = z.infer<typeof UserSearchParamsSchema>;
export type UserSearchResponse = z.infer<typeof UserSearchResponseSchema>;

// Now you can use these types throughout your app with full type safety!
// Example:
export function processUser(user: User) {
  console.log(`Processing user ${user.name} with role ${user.role}`);
  // user.role is typed as 'admin' | 'user' | 'moderator'
  // All properties have full intellisense!
}
