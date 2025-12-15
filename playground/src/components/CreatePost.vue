<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '../api-client';

const title = ref('');
const body = ref('');
const userId = ref(1);

const { result, isLoading, error, mutate } = useApi.mutation.createPost({
  onResult: (data: any) => {
    console.log('Post created:', data);
    // Reset form
    title.value = '';
    body.value = '';
    userId.value = 1;
  },
  onZodError(issues) {
    console.log(issues[0]?.message);
  },
  onError: (error: string) => {
    console.error('Error creating post:', error);
  }
});

const handleSubmit = () => {
  if (!title.value || !body.value) {
    return;
  }

  mutate({
    title: title.value,
    body: body.value,
    userId: userId.value,
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Create New Post</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
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
          required
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
        :disabled="isLoading || !title || !body"
        class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {{ isLoading ? 'Creating...' : 'Create Post' }}
      </button>
    </form>

    <div v-if="error" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error creating post</p>
      <p class="text-sm mt-1">{{ error }}</p>
    </div>

    <div v-if="result" class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
      <p class="font-medium mb-2">✓ Post created successfully!</p>
      <div class="text-sm space-y-1">
        <p><strong>ID:</strong> {{ result.id }}</p>
        <p><strong>Title:</strong> {{ result.title }}</p>
        <p><strong>Body:</strong> {{ result.body }}</p>
      </div>
    </div>
  </div>
</template>
