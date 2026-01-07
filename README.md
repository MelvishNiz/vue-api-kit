
# 🚀 vue-api-kit

[![NPM Version](https://img.shields.io/npm/v/vue-api-kit.svg?style=flat-square)](https://www.npmjs.com/package/vue-api-kit)
[![Install Size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=vue-api-kit&query=$.install.pretty&label=install%20size&style=flat-square)](https://packagephobia.now.sh/result?p=vue-api-kit)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/vue-api-kit?style=flat-square)](https://bundlephobia.com/result?p=vue-api-kit)
[![NPM Downloads](https://img.shields.io/npm/dm/vue-api-kit.svg?style=flat-square)](https://npm-stat.com/charts.html?package=vue-api-kit)
[![CI Status](https://img.shields.io/github/actions/workflow/status/MelvishNiz/vue-api-kit/release.yml?label=CI&logo=github&style=flat-square)](https://github.com/MelvishNiz/vue-api-kit/actions)
[![License](https://img.shields.io/npm/l/vue-api-kit.svg?style=flat-square)](https://github.com/MelvishNiz/vue-api-kit/blob/main/LICENSE)

A powerful and type-safe API client for Vue 3 applications with built-in validation using Zod.

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Features](#-core-features)
- [Basic Usage](#-basic-usage)
  - [Queries (GET)](#queries-get)
  - [Queries (POST)](#queries-post)
  - [Mutations (POST/PUT/DELETE)](#mutations-postputdelete)
- [Configuration](#-configuration)
- [Advanced Features](#-advanced-features)
  - [Nested Structure](#nested-structure)
  - [Modular API Definitions](#modular-api-definitions)
  - [Request Interceptors](#request-interceptors)
  - [File Upload](#file-upload)
  - [CSRF Protection](#csrf-protection)
- [License](#-license)

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
  baseURL: 'https://api.example.com',
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
    }
  }
});
```

Use in your Vue components:

```vue
<script setup lang="ts">
import { api } from './api';

// Query - auto-loads on mount
const { result, isLoading, errorMessage } = api.query.getUsers();

// Mutation
const { mutate, isLoading: creating } = api.mutation.createUser();

async function handleCreate() {
  await mutate({ name: 'John', email: 'john@example.com' });
}
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="errorMessage">Error: {{ errorMessage }}</div>
  <ul v-else>
    <li v-for="user in result" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

## 🎯 Core Features

- ✅ **Type-Safe** - Full TypeScript support with automatic type inference
- ✅ **Zod Validation** - Built-in request/response validation
- ✅ **Vue 3 Composition API** - Reactive state management
- ✅ **Lightweight** - ~7kB minified (2.2kB gzipped)
- ✅ **Auto Loading States** - Built-in loading, error, and success states
- ✅ **Path Parameters** - Automatic path parameter replacement (`/users/{id}`)
- ✅ **Debouncing** - Built-in request debouncing
- ✅ **POST Queries** - Support both GET and POST for data fetching
- ✅ **File Upload** - Multipart/form-data with nested objects
- ✅ **CSRF Protection** - Automatic token refresh (Laravel Sanctum compatible)
- ✅ **Modular** - Split API definitions across files
- ✅ **Nested Structure** - Organize endpoints hierarchically
- ✅ **Tree-Shakeable** - Only bundles what you use

## 📖 Basic Usage

### Queries (GET)

Use queries to fetch data. They automatically load on component mount:

```vue
<script setup lang="ts">
import { api } from './api';
import { ref } from 'vue';

// Simple query - automatically loads data on mount
const { result, isLoading, errorMessage } = api.query.getUsers();

// Query with parameters - reactive to parameter changes
const userId = ref(1);
const { result: user, refetch } = api.query.getUser({
  params: { id: userId }
});

// Query with options - customize behavior
const { result: data } = api.query.getUsers({
  loadOnMount: true,
  debounce: 300,
  onResult: (data) => console.log('Loaded:', data),
  onError: (error) => console.error('Error:', error)
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="errorMessage">Error: {{ errorMessage }}</div>
  <ul v-else>
    <li v-for="user in result" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

### Queries (POST)

POST queries are perfect for complex searches with filters:

```typescript
// API definition
queries: {
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
    response: z.array(z.object({ id: z.number(), name: z.string() }))
  }
}
```

```vue
<script setup lang="ts">
const searchTerm = ref('');
const { result, isLoading, refetch } = api.query.searchUsers({
  data: {
    query: searchTerm.value,
    filters: { active: true }
  },
  loadOnMount: false
});
</script>

<template>
  <input v-model="searchTerm" @keyup.enter="refetch" />
  <button @click="refetch" :disabled="isLoading">Search</button>
  <div v-if="isLoading">Searching...</div>
  <div v-else-if="result">
    <div v-for="user in result" :key="user.id">{{ user.name }}</div>
  </div>
</template>
```

### Mutations (POST/PUT/DELETE)

```vue
<script setup lang="ts">
const { mutate, isLoading, result, errorMessage } = api.mutation.createUser({
  onResult: (data) => console.log('Created:', data),
  onError: (error) => console.error('Error:', error)
});

const name = ref('');
const email = ref('');

async function handleSubmit() {
  await mutate({ name: name.value, email: email.value });
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

## ⚙️ Configuration

```typescript
const api = createApiClient({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token'
  },
  withCredentials: true,  // Enable cookies
  withXSRFToken: true,    // Enable XSRF token handling

  // CSRF token refresh endpoint
  csrfRefreshEndpoint: '/sanctum/csrf-cookie',

  // Global handlers
  onBeforeRequest: async (config) => {
    // Modify requests globally
    const token = localStorage.getItem('token');
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },

  onError: (error) => {
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

## 🔧 Advanced Features

### Nested Structure

Organize endpoints hierarchically for better code organization:

```typescript
import { createApiClient, defineQuery, defineMutation } from 'vue-api-kit';
import { z } from 'zod';

const api = createApiClient({
  baseURL: 'https://api.example.com',
  queries: {
    users: {
      getAll: defineQuery({
        path: '/users',
        response: z.array(z.object({ id: z.number(), name: z.string() }))
      }),
      getById: defineQuery({
        path: '/users/{id}',
        params: z.object({ id: z.number() }),
        response: z.object({ id: z.number(), name: z.string() })
      }),
      search: defineQuery({
        method: 'POST',
        path: '/users/search',
        data: z.object({ query: z.string() }),
        response: z.array(z.object({ id: z.number(), name: z.string() }))
      })
    },
    posts: {
      getAll: defineQuery({
        path: '/posts',
        response: z.array(z.object({ id: z.number(), title: z.string() }))
      }),
      getById: defineQuery({
        path: '/posts/{id}',
        params: z.object({ id: z.number() }),
        response: z.object({ id: z.number(), title: z.string() })
      })
    }
  },
  mutations: {
    users: {
      create: defineMutation({
        method: 'POST',
        path: '/users',
        data: z.object({ name: z.string(), email: z.string() }),
        response: z.object({ id: z.number(), name: z.string() })
      }),
      update: defineMutation({
        method: 'PUT',
        path: '/users/{id}',
        params: z.object({ id: z.number() }),
        data: z.object({ name: z.string() }),
        response: z.object({ id: z.number(), name: z.string() })
      }),
      delete: defineMutation({
        method: 'DELETE',
        path: '/users/{id}',
        params: z.object({ id: z.number() })
      })
    }
  }
});

// Usage
api.query.users.getAll()
api.mutation.users.create()
```

**Benefits:** Better organization, namespace separation, improved readability, scalability.

### Modular API Definitions

Split your API definitions across multiple files:

**user-api.ts**
```typescript
import { defineQuery, defineMutation } from 'vue-api-kit';
import { z } from 'zod';

export const userQueries = {
  getUsers: defineQuery({
    path: '/users',
    response: z.array(z.object({ id: z.number(), name: z.string() }))
  }),
  getUser: defineQuery({
    path: '/users/{id}',
    params: z.object({ id: z.number() }),
    response: z.object({ id: z.number(), name: z.string() })
  })
};

export const userMutations = {
  createUser: defineMutation({
    method: 'POST',
    path: '/users',
    data: z.object({ name: z.string(), email: z.string() }),
    response: z.object({ id: z.number(), name: z.string() })
  })
};
```

**api.ts**
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

**Benefits:** Separation of concerns, reusability, team collaboration, full type safety.

### Request Interceptors

Add interceptors at global, definition, or runtime level to modify headers and request configuration:

```typescript
// 1. Global interceptor - applies to ALL requests
const api = createApiClient({
  baseURL: 'https://api.example.com',
  onBeforeRequest: async (config) => {
    config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  }
});

// 2. Definition-level interceptor - using defineQuery
import { defineQuery, defineMutation } from 'vue-api-kit';

const userQueries = {
  getProtectedUser: defineQuery({
    path: '/users/{id}',
    params: z.object({ id: z.number() }),
    response: UserSchema,
    onBeforeRequest: async (config) => {
      // Add special headers for this specific endpoint
      config.headers['X-API-Key'] = 'your-api-key';
      config.headers['X-Custom-Auth'] = 'Bearer special-token';
      return config;
    }
  }),
  
  searchUsers: defineQuery({
    method: 'POST',
    path: '/users/search',
    data: z.object({ query: z.string() }),
    response: z.array(UserSchema),
    onBeforeRequest: async (config) => {
      // Fetch and add fresh token
      const token = await refreshAuthToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  })
};

const userMutations = {
  createUser: defineMutation({
    method: 'POST',
    path: '/users',
    data: CreateUserSchema,
    response: UserSchema,
    onBeforeRequest: (config) => {
      // Add request tracking headers
      config.headers['X-Request-ID'] = generateRequestId();
      config.headers['X-Timestamp'] = new Date().toISOString();
      return config;
    }
  })
};

// 3. Runtime interceptor - specific to one call
const { result } = api.query.getUser({
  params: { id: 1 },
  onBeforeRequest: async (config) => {
    // Add runtime-specific headers
    config.headers.Authorization = `Bearer ${await refreshToken()}`;
    config.headers['X-User-Context'] = getCurrentUserId();
    return config;
  }
});
```

**Execution order:** Global → Definition → Runtime

**Use cases:**
- **Global**: Authentication tokens, app version headers, CSRF tokens
- **Definition**: Endpoint-specific API keys, content versioning, rate limiting
- **Runtime**: User-specific tokens, dynamic context, request-specific tracking

### File Upload

Upload files with multipart/form-data support:

```typescript
mutations: {
  uploadImage: {
    method: 'POST',
    path: '/upload',
    isMultipart: true,
    response: z.object({ url: z.string() })
  }
}

// Usage
const { mutate, uploadProgress } = api.mutation.uploadImage({
  onUploadProgress: (progress) => console.log(`${progress}%`)
});

await mutate({ data: { file, name: 'avatar.jpg' } });
```

**Nested objects in multipart:**
```typescript
await mutate({
  data: {
    name: 'Product',
    image: {
      file: file,              // Sent as: image[file]
      file_url: 'url'          // Sent as: image[file_url]
    }
  }
});
```

### CSRF Protection

Built-in CSRF token protection (Laravel Sanctum compatible):

```typescript
const api = createApiClient({
  baseURL: 'https://api.example.com',
  withCredentials: true,              // Enable cookies
  withXSRFToken: true,                // Enable XSRF token handling
  csrfRefreshEndpoint: '/sanctum/csrf-cookie',  // Refresh endpoint
  mutations: { /* ... */ }
});
```

**How it works:**
1. Axios automatically reads `XSRF-TOKEN` cookie
2. Sends it as `X-XSRF-TOKEN` header
3. On 403/419 errors, refreshes CSRF token automatically
4. Retries the original request

**Laravel CORS config:**
```php
// config/cors.php
'supports_credentials' => true,
'allowed_origins' => ['http://localhost:5173'],
```

## 📝 License

MIT

## 👤 Author

**MelvishNiz** - [GitHub](https://github.com/MelvishNiz)
