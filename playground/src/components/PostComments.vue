<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '../api-client';

const postId = ref('1');
const { result: comments, isLoading, errorMessage, refetch } = useApi.query.comments({
  params: { postId: postId.value },
  loadOnMount: true,
});

const handleFetchComments = () => {
  refetch();
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Post Comments</h2>

    <div class="mb-6 flex items-center gap-4">
      <label class="text-gray-700 font-medium">Post ID:</label>
      <input
        v-model="postId"
        type="text"
        placeholder="Enter post ID"
        class="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        @click="handleFetchComments"
        :disabled="isLoading || !postId"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isLoading ? 'Loading...' : 'Fetch Comments' }}
      </button>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error loading comments</p>
      <p class="text-sm mt-1">{{ errorMessage }}</p>
    </div>

    <div v-else-if="comments && comments.length > 0" class="space-y-4">
      <p class="text-sm text-gray-600 mb-4">Found {{ comments.length }} comments</p>
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-start justify-between mb-2">
          <h4 class="font-semibold text-gray-800">{{ comment.name }}</h4>
          <span class="text-xs text-gray-500">#{{ comment.id }}</span>
        </div>
        <a :href="`mailto:${comment.email}`" class="text-sm text-blue-600 hover:underline mb-2 block">
          {{ comment.email }}
        </a>
        <p class="text-gray-700 text-sm">{{ comment.body }}</p>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      No comments found
    </div>
  </div>
</template>
