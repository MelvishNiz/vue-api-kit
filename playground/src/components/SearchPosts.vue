<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useApi } from '../api-client';

const searchForm = reactive({
  title: '',
  body: '',
  userId: 1,
});

// Example of POST query with reactive data
const { result, isLoading, errorMessage, refetch } = useApi.query.searchPosts({
  data: searchForm,
  loadOnMount: false,
  onResult: (data) => {
    console.log('Search result:', data);
  },
  onError: (error) => {
    console.error('Search error:', error);
  }
});

const handleSearch = () => {
  refetch();
};
</script>

<template>
  <div class="search-container">
    <h2>POST Query Example - Search Posts</h2>
    <div class="search-form">
      <input 
        v-model="searchForm.title" 
        type="text" 
        placeholder="Search by title..."
        @keyup.enter="handleSearch"
      />
      <input 
        v-model="searchForm.body" 
        type="text" 
        placeholder="Search by body..."
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch" :disabled="isLoading">
        {{ isLoading ? 'Searching...' : 'Search' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-else-if="result" class="result">
      <h3>Result:</h3>
      <div class="post-card">
        <h4>{{ result.title }}</h4>
        <p>{{ result.body }}</p>
        <small>User ID: {{ result.userId }}</small>
      </div>
    </div>
    <div v-else class="info">
      Enter a search query and click Search to see POST query in action
    </div>

    <div class="notes">
      <h4>Note about this demo:</h4>
      <p>
        This demonstrates POST query support with reactive form binding. 
        The API endpoint (JSONPlaceholder) doesn't have a real search endpoint, 
        so we're using /posts/1 as a demo. In a real application, you would use 
        a proper search endpoint that accepts POST data with search parameters.
      </p>
      <p>
        <strong>Key Features:</strong>
      </p>
      <ul>
        <li>POST method in queries (not just mutations)</li>
        <li>Full type safety for data parameter</li>
        <li>Validation with Zod schemas</li>
        <li>Reactive form binding with Vue's reactive()</li>
        <li>Automatic re-execution when reactive data changes</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.search-container {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 20px 0;
}

.search-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-form input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-form button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading {
  color: #2196F3;
  padding: 10px;
}

.error {
  color: #f44336;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}

.info {
  color: #666;
  padding: 10px;
  font-style: italic;
}

.result {
  margin-top: 20px;
}

.post-card {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.post-card h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.post-card p {
  margin: 0 0 10px 0;
  color: #666;
}

.post-card small {
  color: #999;
}

.notes {
  margin-top: 30px;
  padding: 15px;
  background-color: #e3f2fd;
  border-radius: 4px;
  border-left: 4px solid #2196F3;
}

.notes h4 {
  margin: 0 0 10px 0;
  color: #1976D2;
}

.notes p {
  margin: 10px 0;
  color: #555;
}

.notes ul {
  margin: 10px 0;
  padding-left: 20px;
}

.notes li {
  margin: 5px 0;
  color: #555;
}
</style>
