<script setup lang="ts">
import { useApi } from '../api-client';

const { result: posts, isLoading, errorMessage, refetch } = useApi.query.posts({
  loadOnMount: true,
  onResult: (data) => {
    console.log('Posts loaded:', data.length);
  },
  onError: (error) => {
    console.error('Error loading posts:', error.message);
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800">All Posts</h2>
      <button
        @click="refetch"
        :disabled="isLoading"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error loading posts</p>
      <p class="text-sm mt-1">{{ errorMessage }}</p>
    </div>

    <div v-else-if="posts && posts.length > 0" class="space-y-4">
      <div
        v-for="post in posts.slice(0, 10)"
        :key="post.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ post.title }}</h3>
            <p class="text-gray-600 text-sm line-clamp-2">{{ post.body }}</p>
          </div>
          <span class="ml-4 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            #{{ post.id }}
          </span>
        </div>
        <div class="mt-3 text-xs text-gray-500">
          User ID: {{ post.userId }}
        </div>
      </div>
      <p class="text-center text-gray-500 text-sm pt-4">
        Showing 10 of {{ posts.length }} posts
      </p>
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      No posts found
    </div>
  </div>
</template>
