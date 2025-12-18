<script setup lang="ts">
import { reactive } from 'vue';
import { useApiSanctum } from '../api-client';

const form = reactive({
  email: "",
  password: "",
  is_remember_me: false
})

const { result, isLoading, errorMessage, mutate } = useApiSanctum.mutation.authLogin({
  onResult: (data) => {
    console.log('Post created:', data);
  },
  onZodError(issues) {
    console.log(issues[0]?.message);
  },
  onError: (error) => {
    console.error('Error creating post:', error);
  }
});

const handleSubmit = () => {
  if (!form.email || !form.password) {
    return;
  }

  mutate({
    data: form
  });
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Login Sanctum Laravel</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Password</label>
        <input
          v-model="form.password"
          type="password"
          placeholder="Enter your password"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Remember Me</label>
        <input
          v-model="form.is_remember_me"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading || !form.email || !form.password"
        class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>

    <div v-if="errorMessage" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error logging in</p>
      <p class="text-sm mt-1">{{ errorMessage }}</p>
    </div>

    <div v-if="result" class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
      <p class="font-medium mb-2">✓ Logged in successfully!</p>
      <div class="text-sm space-y-1">
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>
