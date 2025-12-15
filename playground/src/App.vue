<script setup lang="ts">
import { ref } from 'vue';
import PostsList from './components/PostsList.vue';
import SinglePost from './components/SinglePost.vue';
import PostComments from './components/PostComments.vue';
import CreatePost from './components/CreatePost.vue';
import UpdatePost from './components/UpdatePost.vue';
import DeletePost from './components/DeletePost.vue';
import UploadImage from './components/UploadImage.vue';

const activeTab = ref('posts');

const tabs = [
  { id: 'posts', name: 'All Posts', icon: '📝' },
  { id: 'single', name: 'Single Post', icon: '📄' },
  { id: 'comments', name: 'Comments', icon: '💬' },
  { id: 'create', name: 'Create Post', icon: '➕' },
  { id: 'update', name: 'Update Post', icon: '✏️' },
  { id: 'delete', name: 'Delete Post', icon: '🗑️' },
  { id: 'upload', name: 'Upload Image', icon: '📤' },
];
</script>

<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Vue API Kit</h1>
        <p class="text-gray-600">Type-safe API client with Zod validation</p>
      </div>

      <!-- Tabs Navigation -->
      <div class="bg-white rounded-lg shadow-md mb-6 p-2">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 min-w-[140px] px-4 py-3 rounded-lg font-medium transition-all',
              activeTab === tab.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            ]"
          >
            <span class="mr-2">{{ tab.icon }}</span>
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="mx-auto">
        <PostsList v-if="activeTab === 'posts'" />
        <SinglePost v-if="activeTab === 'single'" />
        <PostComments v-if="activeTab === 'comments'" />
        <CreatePost v-if="activeTab === 'create'" />
        <UpdatePost v-if="activeTab === 'update'" />
        <DeletePost v-if="activeTab === 'delete'" />
        <UploadImage v-if="activeTab === 'upload'" />
      </div>

      <!-- Footer -->
      <div class="text-center mt-12 text-gray-600 text-sm">
        <p>API powered by <a href="https://jsonplaceholder.typicode.com" target="_blank" class="text-blue-600 hover:underline">JSONPlaceholder</a></p>
      </div>
    </div>
  </div>
</template>