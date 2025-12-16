<script setup lang="ts">
import { api } from '../examples/merged-api-example';

// Demonstrate merged queries - both user and post queries are available
const { result: users, isLoading: usersLoading, errorMessage: usersError } = api.query.getUsers({
  params: { page: 1, limit: 5 },
  loadOnMount: true,
  onResult: (data) => {
    console.log('Users loaded from merged API:', data.length);
  }
});

const { result: posts, isLoading: postsLoading, errorMessage: postsError } = api.query.getPosts({
  params: { userId: 1 },
  loadOnMount: true,
  onResult: (data) => {
    console.log('Posts loaded from merged API:', data.length);
  }
});

// Demonstrate merged mutations
const { mutate: createUser, isLoading: creatingUser } = api.mutation.createUser({
  onResult: (user) => {
    console.log('User created via merged API:', user.id);
  },
  onError: (error) => {
    console.error('Error creating user:', error);
  }
});

const { mutate: createPost, isLoading: creatingPost } = api.mutation.createPost({
  onResult: (post) => {
    console.log('Post created via merged API:', post.id);
  }
});

const handleCreateUser = async () => {
  await createUser({
    data: {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com'
    }
  });
};

const handleCreatePost = async () => {
  await createPost({
    data: {
      title: 'New Post from Merged API',
      body: 'This post was created using the merged API utilities!',
      userId: 1
    }
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Modular API Demo</h2>
    
    <div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="font-semibold text-blue-900 mb-2">✨ What's Happening Here?</h3>
      <p class="text-sm text-blue-800">
        This component uses a single API client created by merging separate user and post API definitions.
        All queries and mutations maintain full type safety!
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Users Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Users (from user-api.ts)</h3>
        
        <div v-if="usersLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        
        <div v-else-if="usersError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {{ usersError }}
        </div>
        
        <div v-else-if="users && users.length > 0" class="space-y-3">
          <div
            v-for="user in users.slice(0, 3)"
            :key="user.id"
            class="border border-gray-200 rounded p-3 bg-gray-50"
          >
            <p class="font-medium text-gray-800">{{ user.name }}</p>
            <p class="text-sm text-gray-600">{{ user.email }}</p>
          </div>
          <button
            @click="handleCreateUser"
            :disabled="creatingUser"
            class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {{ creatingUser ? 'Creating...' : '➕ Create User' }}
          </button>
        </div>
      </div>

      <!-- Posts Section -->
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Posts (from post-api.ts)</h3>
        
        <div v-if="postsLoading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        
        <div v-else-if="postsError" class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {{ postsError }}
        </div>
        
        <div v-else-if="posts && posts.length > 0" class="space-y-3">
          <div
            v-for="post in posts.slice(0, 3)"
            :key="post.id"
            class="border border-gray-200 rounded p-3 bg-gray-50"
          >
            <p class="font-medium text-gray-800 text-sm">{{ post.title }}</p>
            <p class="text-xs text-gray-600 line-clamp-2 mt-1">{{ post.body }}</p>
          </div>
          <button
            @click="handleCreatePost"
            :disabled="creatingPost"
            class="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {{ creatingPost ? 'Creating...' : '➕ Create Post' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Type Safety Demo -->
    <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <h3 class="font-semibold text-green-900 mb-2">🔒 Type Safety Features</h3>
      <ul class="text-sm text-green-800 space-y-1">
        <li>✓ All API endpoints are fully typed</li>
        <li>✓ Parameters and data are validated at compile time</li>
        <li>✓ Response types are automatically inferred</li>
        <li>✓ No type information lost during merge</li>
        <li>✓ IntelliSense works perfectly in IDE</li>
      </ul>
    </div>
  </div>
</template>
