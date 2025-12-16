# Modular API Feature - Implementation Guide

## Overview

The modular API feature allows you to organize your API definitions across multiple files and merge them into a single, fully type-safe API client. This is especially useful for large applications with many endpoints.

## Key Benefits

✅ **Full Type Safety** - TypeScript infers all types correctly, no information lost during merge
✅ **Better Organization** - Keep related endpoints together in separate modules
✅ **Team Collaboration** - Different team members can work on different API modules
✅ **Code Reusability** - Import and reuse API definitions across multiple clients
✅ **Easy Testing** - Test individual API modules in isolation
✅ **Scalability** - Manage large APIs without cluttering a single file

## API Structure

```
src/
├── api/
│   ├── user-api.ts      # User-related queries and mutations
│   ├── post-api.ts      # Post-related queries and mutations
│   ├── comment-api.ts   # Comment-related queries and mutations
│   └── index.ts         # Merged API client
└── components/
    └── UserList.vue     # Component using the merged API
```

## Implementation Steps

### 1. Define API Modules

Create separate files for each domain/entity:

**user-api.ts**
```typescript
import { z } from 'vue-api-kit';

export const userQueries = {
  getUsers: {
    method: 'GET' as const,
    path: '/users',
    response: z.array(z.object({ id: z.number(), name: z.string() }))
  }
} as const;

export const userMutations = {
  createUser: {
    method: 'POST' as const,
    path: '/users',
    data: z.object({ name: z.string() }),
    response: z.object({ id: z.number(), name: z.string() })
  }
} as const;
```

### 2. Merge API Definitions

Create a main API client file that imports and merges all modules:

**api/index.ts**
```typescript
import { createApiClient, mergeQueries, mergeMutations } from 'vue-api-kit';
import { userQueries, userMutations } from './user-api';
import { postQueries, postMutations } from './post-api';

export const api = createApiClient({
  baseURL: 'https://api.example.com',
  queries: mergeQueries(userQueries, postQueries),
  mutations: mergeMutations(userMutations, postMutations)
});
```

### 3. Use in Components

Import the merged API client and use it like normal:

```typescript
import { api } from '../api';

const { result, isLoading } = api.query.getUsers();
const { mutate } = api.mutation.createUser();
```

## Advanced Usage

### Multiple Merge Levels

You can merge multiple sets of queries/mutations:

```typescript
const queries = mergeQueries(
  userQueries,
  postQueries,
  commentQueries,
  authQueries
);
```

### Conditional Merging

Merge different APIs based on configuration:

```typescript
const queries = process.env.VITE_ENABLE_COMMENTS === 'true'
  ? mergeQueries(baseQueries, commentQueries)
  : baseQueries;
```

### Using mergeApiDefinitions

For more complex scenarios, merge complete API configurations:

```typescript
const config = mergeApiDefinitions(
  { baseURL: 'https://api.example.com' },
  { queries: userQueries, mutations: userMutations },
  { queries: postQueries, mutations: postMutations }
);

export const api = createApiClient(config);
```

## Type Safety Guarantees

The merge utilities preserve all type information:

```typescript
// ✅ All valid - types are inferred correctly
api.query.getUsers()
api.query.getPosts()
api.mutation.createUser({ data: { name: 'John' } })

// ❌ TypeScript errors - caught at compile time
api.query.nonexistent()  // Property 'nonexistent' does not exist
api.mutation.createUser({ data: { invalid: 'field' } })  // Invalid data shape
```

## Testing

Test individual API modules separately:

```typescript
import { createApiClient } from 'vue-api-kit';
import { userQueries, userMutations } from './user-api';

describe('User API', () => {
  const api = createApiClient({
    baseURL: 'http://localhost:3000',
    queries: userQueries,
    mutations: userMutations
  });
  
  it('should fetch users', () => {
    // Test user-specific endpoints
  });
});
```

## Best Practices

1. **Use `as const` assertions** - Ensures literal types are preserved
2. **Group related endpoints** - Keep user, post, auth, etc. in separate files
3. **Export schemas** - Share Zod schemas between frontend and backend
4. **Document your APIs** - Add JSDoc comments to API definitions
5. **Version your APIs** - Use folders like `api/v1/` and `api/v2/`

## Migration Guide

If you have an existing monolithic API definition:

```typescript
// Before (everything in one file)
const api = createApiClient({
  queries: {
    getUsers: { ... },
    getPosts: { ... },
    getComments: { ... }
  },
  mutations: { ... }
});

// After (modular approach)
// 1. Extract to separate files
// user-api.ts
export const userQueries = { getUsers: { ... } };

// post-api.ts  
export const postQueries = { getPosts: { ... } };

// 2. Merge in main file
const api = createApiClient({
  queries: mergeQueries(userQueries, postQueries),
  mutations: mergeMutations(userMutations, postMutations)
});
```

## Performance

The merge utilities use `Object.assign()`, which is extremely fast. There is no performance overhead compared to defining everything inline.

Bundle size impact: **~200 bytes** (minified + gzipped) for all merge utilities.

## Examples

See the following files for complete examples:
- `playground/src/examples/user-api.ts` - User API module
- `playground/src/examples/post-api.ts` - Post API module
- `playground/src/examples/merged-api-example.ts` - Complete merged example
- `playground/src/components/MergedApiDemo.vue` - Vue component demo
