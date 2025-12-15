<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '../api-client';

const postId = ref(1);
const showConfirm = ref(false);

const { result, isLoading, errorMessage, mutate } = useApi.mutation.deletePost({
  onResult: () => {
    console.log('Post deleted');
    showConfirm.value = false;
  },
  onError: (error) => {
    console.error('Error deleting post:', error);
  }
});

const handleDelete = () => {
  mutate({
    params: { id: postId.value }
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Delete Post</h2>

    <div class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Post ID</label>
        <input
          v-model.number="postId"
          type="number"
          min="1"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div v-if="!showConfirm">
        <button
          @click="showConfirm = true"
          class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Delete Post
        </button>
      </div>

      <div v-else class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-800 font-medium mb-4">
          Are you sure you want to delete post #{{ postId }}?
        </p>
        <div class="flex gap-3">
          <button
            @click="handleDelete"
            :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {{ isLoading ? 'Deleting...' : 'Yes, Delete' }}
          </button>
          <button
            @click="showConfirm = false"
            :disabled="isLoading"
            class="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error deleting post</p>
      <p class="text-sm mt-1">{{ errorMessage }}</p>
    </div>

    <div v-if="result" class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
      <p class="font-medium">✓ Post #{{ postId }} deleted successfully!</p>
    </div>
  </div>
</template>
