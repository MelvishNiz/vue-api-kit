<script setup lang="ts">
import { reactive } from 'vue';
import { useApi } from '../api-client';

const params = reactive<{
  id: number;
}>({
  id: 1
})
const { result: post, isLoading, errorMessage, zodError, refetch } = useApi.query.post({
  params,
  loadOnMount: true,
  debounce: 300,
  onResult: (data: any) => {
    console.log('Post loaded:', data);
  },
  onError: (error) => {
    console.error('Error loading post:', error);
  }
});

const handleFetchPost = () => {
  refetch();
};

const incrementPostId = () => {
  params.id++;
};

const decrementPostId = () => {
  if (params.id > 1) {
    params.id--;
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Single Post</h2>

    <div class="mb-6 flex items-center gap-4">
      <label class="text-gray-700 font-medium">Post ID:</label>
      <div class="flex items-center gap-2">
        <button
          @click="decrementPostId"
          :disabled="params.id <= 1"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <input
          v-model.number="params.id"
          type="number"
          min="1"
          class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          @click="incrementPostId"
          class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
      <button
        @click="handleFetchPost"
        :disabled="isLoading"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isLoading ? 'Loading...' : 'Fetch Post' }}
      </button>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>

    <!-- <div v-else-if="zodError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error Validations</p>
      <p class="text-sm mt-1">{{ zodError }}</p>
    </div> -->

    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error loading post</p>
      <p class="text-sm mt-1">{{ errorMessage }}</p>
    </div>

    <div v-else-if="post" class="border border-gray-200 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-gray-800">{{ post.title }}</h3>
        <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
          #{{ post.id }}
        </span>
      </div>
      <p class="text-gray-700 leading-relaxed mb-4">{{ post.body }}</p>
      <div class="pt-4 border-t border-gray-200">
        <span class="text-sm text-gray-500">User ID: {{ post.userId }}</span>
      </div>
    </div>
  </div>
</template>
