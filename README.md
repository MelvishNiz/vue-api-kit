

# 🚀 vue-api-kit

[![NPM Version](https://img.shields.io/npm/v/vue-api-kit.svg?style=flat-square)](https://www.npmjs.com/package/vue-api-kit)
[![Install Size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=vue-api-kit&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=vue-api-kit)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/vue-api-kit?style=flat-square)](https://bundlephobia.com/result?p=vue-api-kit)
[![NPM Downloads](https://img.shields.io/npm/dm/vue-api-kit.svg?style=flat-square)](https://npm-stat.com/charts.html?package=vue-api-kit)
[![CI Status](https://img.shields.io/github/actions/workflow/status/MelvishNiz/vue-api-kit/release.yml?label=CI&logo=github&style=flat-square)](https://github.com/MelvishNiz/vue-api-kit/actions)
[![License](https://img.shields.io/npm/l/vue-api-kit.svg?style=flat-square)](https://github.com/MelvishNiz/vue-api-kit/blob/main/LICENSE)

A powerful and type-safe API client for Vue 3 applications with built-in validation using Zod.

## 📦 Installation

```bash
npm install vue-api-kit
```

## ⚡ Quick Start

```typescript
import { createApiClient } from 'vue-api-kit';
import { z } from 'zod';

// Define your API client
const api = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  queries: {
    getUsers: {
      path: '/users',
      response: z.array(z.object({
        id: z.number(),
        name: z.string(),
        email: z.string()
      }))
    },
    getUser: {
      path: '/users/{id}',
      params: z.object({ id: z.number() }),
      response: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string()
      })
    },
    // POST query for complex searches
    searchUsers: {
      method: 'POST',
      path: '/users/search',
      data: z.object({
        query: z.string(),
        filters: z.object({
          active: z.boolean().optional(),
          role: z.string().optional()
        }).optional()
      }),
      response: z.array(z.object({
        id: z.number(),
        name: z.string(),
        email: z.string()
      }))
    }
  },
  mutations: {
    createUser: {
      method: 'POST',
      path: '/users',
      data: z.object({
        name: z.string(),
        email: z.string().email()
      }),
      response: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string()
      })
    },
    updateUser: {
      method: 'PUT',
      path: '/users/{id}',
      params: z.object({ id: z.number() }),
      data: z.object({
        name: z.string(),
        email: z.string().email()
      })
    },
    deleteUser: {
      method: 'DELETE',
      path: '/users/{id}',
      params: z.object({ id: z.number() })
    }
  }
});
```

## 📖 Usage in Vue Components

### Queries (GET and POST requests)

Queries support both GET and POST methods, allowing you to fetch data with complex search criteria.

#### GET Queries

```vue
<script setup lang="ts">
import { api } from './api';

// Simple query - loads automatically on mount
const { result, isLoading, errorMessage } = api.query.getUsers();

// Query with parameters
const userId = ref(1);
const { result: user, isLoading: loading, refetch } = api.query.getUser({
  params: { id: userId }
});

// Query with options
const { result: data } = api.query.getUsers({
  loadOnMount: true,
  debounce: 300,
  onResult: (data) => {
    console.log('Data loaded:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="errorMessage">Error: {{ errorMessage }}</div>
    <ul v-else>
      <li v-for="user in result" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>
```

#### POST Queries

POST queries are perfect for complex searches, filtering, or any operation that requires sending data in the request body.

```vue
<script setup lang="ts">
import { api } from './api';
import { ref } from 'vue';

const searchTerm = ref('');

const { result, isLoading, refetch } = api.query.searchUsers({
  data: {
    query: searchTerm.value,
    filters: {
      active: true,
      role: 'admin'
    }
  },
  loadOnMount: false,
  onResult: (data) => {
    console.log('Search results:', data);
  }
});

const handleSearch = () => {
  refetch();
};
</script>

<template>
  <div>
    <input v-model="searchTerm" @keyup.enter="handleSearch" />
    <button @click="handleSearch" :disabled="isLoading">Search</button>

    <div v-if="isLoading">Searching...</div>
    <div v-else-if="result">
      <div v-for="user in result" :key="user.id">
        {{ user.name }}
      </div>
    </div>
  </div>
</template>
```

### Mutations (POST, PUT, DELETE)

```vue
<script setup lang="ts">
import { api } from './api';
import { ref } from 'vue';

const { mutate, isLoading, result, errorMessage } = api.mutation.createUser({
  onResult: (data) => {
    console.log('User created:', data);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});

const name = ref('');
const email = ref('');

async function handleSubmit() {
  await mutate({
    name: name.value,
    email: email.value
  });
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="name" placeholder="Name" />
    <input v-model="email" placeholder="Email" />
    <button type="submit" :disabled="isLoading">
      {{ isLoading ? 'Creating...' : 'Create User' }}
    </button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </form>
</template>
```

## 🎯 Features

- ✅ **Type-Safe**: Full TypeScript support with automatic type inference
- ✅ **Zod Validation**: Built-in request/response validation
- ✅ **Vue 3 Composition API**: Reactive state management
- ✅ **Lightweight**: ~7kB minified (2.2kB gzipped) - optimized for production
- ✅ **Auto Loading States**: Built-in loading, error, and success states
- ✅ **POST Queries**: Support for both GET and POST methods in queries for complex data retrieval
- ✅ **Modular APIs**: Merge queries and mutations from separate files with full type safety
- ✅ **File Upload**: Support for multipart/form-data in mutations
- ✅ **Path Parameters**: Automatic path parameter replacement
- ✅ **Debouncing**: Built-in request debouncing
- ✅ **CSRF Protection**: Automatic CSRF token refresh on 403/419 errors
- ✅ **Global Error Handling**: Centralized error management
- ✅ **Request Interceptors**: Modify requests before sending
- ✅ **Fully Typed**: Complete type inference for params, data, and response
- ✅ **Tree-Shakeable**: Only bundles what you use

## 🔧 Advanced Configuration

```typescript
const api = createApiClient({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token'
  },
  withCredentials: true, // Enable cookies
  withXSRFToken: true,   // Enable automatic XSRF token handling

  // CSRF Token Protection
  csrfRefreshEndpoint: '/sanctum/csrf-cookie', // Auto-refresh CSRF token on 403/419 errors

  // Global handlers
  onBeforeRequest: async (config) => {
    // Modify request before sending
    const token = localStorage.getItem('token');
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },

  onStartRequest: async () => {
    // Called when request starts
    console.log('Request started');
  },

  onFinishRequest: async () => {
    // Called when request finishes (success or error)
    console.log('Request finished');
  },

  onErrorRequest: (error) => {
    // Global error handler
    console.error('API Error:', error.message);
  },

  onZodError: (issues) => {
    // Handle validation errors
    console.error('Validation errors:', issues);
  },

  queries: { /* ... */ },
  mutations: { /* ... */ }
});
```

## 🧩 Modular API Definitions

For large applications, you can organize your API definitions into separate files and merge them together with full type safety.

### Step 1: Define API modules in separate files

**user-api.ts** - User-related queries and mutations
```typescript
import { z, defineQuery, defineMutation } from 'vue-api-kit';

export const userQueries = {
  getUsers: defineQuery({
    method: 'GET',
    path: '/users',
    response: z.array(z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    }))
  }),
  getUser: defineQuery({
    method: 'GET',
    path: '/users/{id}',
    params: z.object({ id: z.number() }),
    response: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    })
  })
};

export const userMutations = {
  createUser: defineMutation({
    method: 'POST',
    path: '/users',
    data: z.object({
      name: z.string(),
      email: z.string().email()
    }),
    response: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    })
  }),
  updateUser: defineMutation({
    method: 'PUT',
    path: '/users/{id}',
    params: z.object({ id: z.number() }),
    data: z.object({
      name: z.string().optional(),
      email: z.string().email().optional()
    }),
    response: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email()
    })
  })
};
```

**post-api.ts** - Post-related queries and mutations
```typescript
import { z, defineQuery, defineMutation } from 'vue-api-kit';

export const postQueries = {
  getPosts: defineQuery({
    method: 'GET',
    path: '/posts',
    response: z.array(z.object({
      id: z.number(),
      title: z.string(),
      body: z.string()
    }))
  })
};

export const postMutations = {
  createPost: defineMutation({
    method: 'POST',
    path: '/posts',
    data: z.object({
      title: z.string(),
      body: z.string()
    }),
    response: z.object({
      id: z.number(),
      title: z.string(),
      body: z.string()
    })
  })
};
```

### Step 2: Merge API definitions

**api.ts** - Main API client with merged definitions
```typescript
import { createApiClient, mergeQueries, mergeMutations } from 'vue-api-kit';
import { userQueries, userMutations } from './user-api';
import { postQueries, postMutations } from './post-api';

// Approach 1: Merge queries and mutations separately
export const api = createApiClient({
  baseURL: 'https://api.example.com',

  // Merge all queries from different modules
  queries: mergeQueries(userQueries, postQueries),

  // Merge all mutations from different modules
  mutations: mergeMutations(userMutations, postMutations)
});

// Now you can use all queries and mutations with full type safety!
// api.query.getUsers()    ✓ Fully typed
// api.query.getPosts()    ✓ Fully typed
// api.mutation.createUser ✓ Fully typed
// api.mutation.createPost ✓ Fully typed
```

### Benefits of Modular Approach

- **Separation of Concerns**: Keep related API endpoints together in dedicated files
- **Reusability**: Import and reuse API definitions across multiple clients
- **Team Collaboration**: Different team members can work on different API modules independently
- **Full Type Safety**: TypeScript infers all types correctly, no loss of type information when merging
- **No Manual Type Assertions**: Use `defineQuery()` and `defineMutation()` helpers instead of `as const`
- **Easy Testing**: Test individual API modules in isolation
- **Better Organization**: Manage large APIs without cluttering a single file

## 📤 File Upload Example

File uploads are supported in mutations using the `isMultipart` flag.

```typescript
const api = createApiClient({
  baseURL: 'https://api.example.com',
  mutations: {
    uploadImage: {
      method: 'POST',
      path: '/upload',
      isMultipart: true, // Enable multipart/form-data
      response: z.object({
        url: z.string()
      })
    }
  }
});

// In component
const { mutate, uploadProgress } = api.mutation.uploadImage({
  onUploadProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
});

async function handleUpload(file: File) {
  await mutate({ data: { file } });
}
```

## 🔒 CSRF Token Protection

The client includes built-in CSRF token protection, perfect for Laravel Sanctum or similar CSRF-based authentication systems.

### How it works

**Automatic XSRF Token Handling:**
1. Set `withCredentials: true` to enable cookie-based authentication
2. Set `withXSRFToken: true` to enable automatic XSRF token handling
3. Axios automatically reads `XSRF-TOKEN` cookie and sends it as `X-XSRF-TOKEN` header
4. This satisfies Laravel Sanctum's CSRF protection requirements

**Automatic CSRF Refresh:**
1. Detects CSRF errors (403 or 419 status codes)
2. Calls the CSRF refresh endpoint to get a new token
3. Retries the original request automatically with the fresh token
4. Prevents infinite loops and race conditions

### Configuration

```typescript
const api = createApiClient({
  baseURL: 'https://api.example.com',
  withCredentials: true,   // Enable cookies for authentication
  withXSRFToken: true,     // Enable automatic XSRF token handling
  csrfRefreshEndpoint: '/sanctum/csrf-cookie', // Laravel Sanctum endpoint
  queries: { /* ... */ },
  mutations: { /* ... */ }
});
```

### Use Case: Laravel Sanctum

```typescript
// api.ts
import { createApiClient } from 'vue-api-kit';
import { z } from 'zod';

export const api = createApiClient({
  baseURL: 'https://api.example.com',
  withCredentials: true,   // Enables cookies
  withXSRFToken: true,     // Enables automatic XSRF-TOKEN header
  csrfRefreshEndpoint: '/sanctum/csrf-cookie', // Laravel's CSRF endpoint  mutations: {
    login: {
      method: 'POST',
      path: '/login',
      data: z.object({
        email: z.string().email(),
        password: z.string()
      }),
      response: z.object({
        user: z.object({
          id: z.number(),
          name: z.string(),
          email: z.string()
        })
      })
    },
    createPost: {
      method: 'POST',
      path: '/posts',
      data: z.object({
        title: z.string(),
        content: z.string()
      })
    }
  }
});
```

### Benefits

- ✅ **Separate Options**: `withCredentials` and `withXSRFToken` can be configured independently
- ✅ **Built-in XSRF Support**: Axios `withXSRFToken` handles token automatically
- ✅ **Automatic Recovery**: No manual token refresh needed
- ✅ **Seamless UX**: Users don't experience authentication errors
- ✅ **Race Condition Safe**: Multiple simultaneous requests share the same refresh
- ✅ **Infinite Loop Prevention**: Won't retry the CSRF endpoint itself
- ✅ **Laravel Sanctum Compatible**: Works perfectly with Laravel's SPA authentication

### Important Notes

1. **Two separate options**:
   - `withCredentials: true` - Enables sending cookies with requests
   - `withXSRFToken: true` - Enables automatic XSRF token header handling
2. **Cookie Domain**: Ensure your API sets cookies with the correct domain (e.g., `.localhost` for local development)
3. **CORS Configuration**: Your Laravel backend must allow credentials:
   ```php
   // config/cors.php
   'supports_credentials' => true,
   'allowed_origins' => ['http://localhost:5173'],
   ```



## 📝 License

MIT

## 👤 Author

MelvishNiz - [GitHub](https://github.com/MelvishNiz)
