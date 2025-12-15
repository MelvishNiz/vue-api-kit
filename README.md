# 🚀 vue-api-kit

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

### Queries (GET requests)

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
- ✅ **Auto Loading States**: Built-in loading, error, and success states
- ✅ **File Upload**: Support for multipart/form-data
- ✅ **Path Parameters**: Automatic path parameter replacement
- ✅ **Debouncing**: Built-in request debouncing
- ✅ **Global Error Handling**: Centralized error management
- ✅ **Request Interceptors**: Modify requests before sending

## 🔧 Advanced Configuration

```typescript
const api = createApiClient({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token'
  },
  withCredentials: true,

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
    // Called when request finishes
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

## 📤 File Upload Example

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
  await mutate({ file });
}
```

## 📝 License

MIT

## 👤 Author

MelvishNiz - [GitHub](https://github.com/MelvishNiz)
