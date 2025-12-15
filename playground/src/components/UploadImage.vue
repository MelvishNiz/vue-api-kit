<script setup lang="ts">
import { ref } from 'vue';
import { useApiUpload } from '../api-client';

const selectedFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);

// This is a demo - you'll need to add this mutation to api-client.ts
const { result, isLoading, error, uploadProgress, mutate } = useApiUpload.mutation.uploadImage({
  onResult: (data: any) => {
    console.log('Image uploaded:', data);
    resetForm();
  },
  onError: (error: string) => {
    console.error('Error uploading image:', error);
  },
  onUploadProgress: (progress: number) => {
    console.log('Upload progress:', progress + '%');
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    if (!file.type.startsWith('image/')) {
      error.value = 'Please select an image file';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      error.value = 'File size must be less than 5MB';
      return;
    }
    
    selectedFile.value = file;
    error.value = undefined;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  if (!selectedFile.value) {
    error.value = 'Please select a file';
    return;
  }
  mutate({
    file: selectedFile.value,
  });
};

const resetForm = () => {
  selectedFile.value = null;
  previewUrl.value = null;
  uploadProgress.value = 0;
};

const removeFile = () => {
  selectedFile.value = null;
  previewUrl.value = null;
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Upload Image</h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- File Upload Area -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Image File</label>
        
        <div v-if="!selectedFile" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input 
            type="file" 
            @change="handleFileChange"
            accept="image/*"
            class="hidden"
            id="file-upload"
          />
          <label for="file-upload" class="cursor-pointer">
            <div class="text-gray-400 mb-2">
              <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <p class="text-gray-600 font-medium">Click to upload image</p>
            <p class="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
          </label>
        </div>

        <!-- Preview -->
        <div v-else class="relative border-2 border-gray-200 rounded-lg p-4">
          <button
            type="button"
            @click="removeFile"
            class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div class="flex items-center gap-4">
            <img 
              v-if="previewUrl" 
              :src="previewUrl" 
              alt="Preview" 
              class="w-32 h-32 object-cover rounded-lg"
            />
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ selectedFile.name }}</p>
              <p class="text-sm text-gray-500">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Progress -->
      <div v-if="isLoading" class="space-y-2">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Uploading...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            class="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex gap-3">
        <button 
          type="submit"
          :disabled="isLoading || !selectedFile"
          class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {{ isLoading ? 'Uploading...' : 'Upload Image' }}
        </button>
        <button 
          type="button"
          @click="resetForm"
          :disabled="isLoading"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-medium"
        >
          Reset
        </button>
      </div>
    </form>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p class="font-medium">Error</p>
      <p class="text-sm mt-1">{{ error }}</p>
    </div>

    <!-- Success Message -->
    <div v-if="result" class="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
      <p class="font-medium mb-2">✓ Image uploaded successfully!</p>
      <div class="text-sm space-y-1">
        <a :href="result.data.url" target="_blank" class="text-blue-600 underline">{{ result.data.url }}</a>
      </div>
    </div>
  </div>
</template>
