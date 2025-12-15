<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '../api-client';

const postId = ref(1);
const title = ref('Updated Title');
const body = ref('Updated body content');
const userId = ref(1);

const { result, isLoading, errorMessage, mutate } = useApi.mutation.updatePost({
  onResult: (data: any) => {
    console.log('Post updated:', data);
  },
  onError: (error) => {
    console.error('Error updating post:', error);
  }
});

const handleSubmit = () => {
  if (!title.value || !body.value) {
    return;
  }

  mutate({
    params: { id: postId.value },
    title: title.value,
    body: body.value,
    userId: userId.value,
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Update Post</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Post ID</label>
        <input
          v-model.number="postId"
          type="number"
          min="1"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Title</label>
        <input
          v-model="title"
          type="text"
          placeholder="Enter post title"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Body</label>
        <textarea
          v-model="body"
          placeholder="Enter post content"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        ></textarea>
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">User ID</label>
        <input
          v-model.number="userId"
          type="number"
          min="1"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading || !title"
        class="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {{ isLoading ? 'Updating...' : 'Update Post' }}
      </button>
    </form>

    <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error updating post</p>
      <p class="text-sm mt-1">{{ errorMessage }}</p>
    </div>

    <div v-if="result" class="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
      <p class="font-medium mb-2">✓ Post updated successfully!</p>
      <div class="text-sm space-y-1">
        <p><strong>ID:</strong> {{ result.id }}</p>
        <p><strong>Title:</strong> {{ result.title }}</p>
        <p><strong>Body:</strong> {{ result.body }}</p>
      </div>
    </div>
  </div>
</template>
