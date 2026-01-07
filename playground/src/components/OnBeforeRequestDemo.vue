<script setup lang="ts">
import { ref } from 'vue';
import { createApiClient } from '../../../dist';
import { queriesWithOnBeforeRequest, mutationsWithOnBeforeRequest } from '../examples/onBeforeRequest-example';
import type { User, Post } from '../examples/onBeforeRequest-example';

// Create API client with global onBeforeRequest
const api = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  // Global level: applies to ALL requests
  onBeforeRequest: (config) => {
    console.log('🌍 Global onBeforeRequest called for:', config.url);
    config.headers['X-App-Name'] = 'Vue-API-Kit-Demo';
    return config;
  },
  queries: queriesWithOnBeforeRequest,
  mutations: mutationsWithOnBeforeRequest,
});

// State
const userId = ref(1);
const selectedUser = ref<User>();
const newPostTitle = ref('');
const newPostBody = ref('');
const createdPost = ref<Post>();
const isCreating = ref(false);
const logs = ref<string[]>([]);

// Example 1: Query with definition-level onBeforeRequest
const { result: protectedUser, isLoading: loadingProtected, refetch: refetchProtected } = 
  api.query.getProtectedUser({
    params: { id: userId },
    onBeforeRequest: (config) => {
      // Runtime level: specific to this call
      const log = `🎯 Runtime onBeforeRequest: Adding user-specific token for user ${userId.value}`;
      console.log(log);
      logs.value.push(log);
      config.headers['X-User-Token'] = `user-token-${userId.value}`;
      return config;
    },
    onResult: (user) => {
      selectedUser.value = user;
      logs.value.push(`✅ User loaded: ${user.name}`);
    }
  });

// Example 2: Mutation with definition-level onBeforeRequest
const { mutate: createPost } = api.mutation.createPost({
  onBeforeRequest: (config) => {
    // Runtime level: specific to this mutation call
    const log = '🎯 Runtime onBeforeRequest: Adding session context';
    console.log(log);
    logs.value.push(log);
    config.headers['X-Session-Context'] = 'demo-session-123';
    return config;
  },
  onResult: (post) => {
    createdPost.value = post;
    logs.value.push(`✅ Post created with ID: ${post.id}`);
    // Clear form
    newPostTitle.value = '';
    newPostBody.value = '';
  }
});

// Handlers
const loadUser = async () => {
  logs.value = [];
  logs.value.push(`📡 Loading user ${userId.value}...`);
  await refetchProtected();
};

const handleCreatePost = async () => {
  if (!newPostTitle.value || !newPostBody.value) {
    logs.value.push('❌ Please fill in all fields');
    return;
  }

  isCreating.value = true;
  logs.value.push('📡 Creating post...');
  
  try {
    await createPost({
      data: {
        title: newPostTitle.value,
        body: newPostBody.value,
        userId: userId.value,
      }
    });
  } catch (error) {
    logs.value.push(`❌ Error: ${error}`);
  } finally {
    isCreating.value = false;
  }
};

const clearLogs = () => {
  logs.value = [];
};
</script>

<template>
  <div class="onbeforerequest-demo">
    <h2>🔧 onBeforeRequest Demo</h2>
    <p class="description">
      This demo shows how headers can be modified at three levels:
      <br><strong>1. Global</strong> (affects all requests),
      <strong>2. Definition</strong> (affects all calls to specific endpoint),
      <strong>3. Runtime</strong> (affects single call)
    </p>

    <div class="demo-grid">
      <!-- Query Example -->
      <div class="demo-section">
        <h3>Query with onBeforeRequest</h3>
        <div class="input-group">
          <label for="userId">User ID:</label>
          <input
            id="userId"
            v-model.number="userId"
            type="number"
            min="1"
            max="10"
          />
          <button @click="loadUser" :disabled="loadingProtected">
            {{ loadingProtected ? 'Loading...' : 'Load User' }}
          </button>
        </div>

        <div v-if="protectedUser" class="result-card">
          <h4>👤 User Details</h4>
          <p><strong>ID:</strong> {{ protectedUser.id }}</p>
          <p><strong>Name:</strong> {{ protectedUser.name }}</p>
          <p><strong>Email:</strong> {{ protectedUser.email }}</p>
        </div>

        <div class="info-box">
          <strong>Headers added for this query:</strong>
          <ul>
            <li>🌍 Global: <code>X-App-Name: Vue-API-Kit-Demo</code></li>
            <li>📋 Definition: <code>X-Custom-Auth: Bearer special-token</code></li>
            <li>🎯 Runtime: <code>X-User-Token: user-token-{userId}</code></li>
          </ul>
        </div>
      </div>

      <!-- Mutation Example -->
      <div class="demo-section">
        <h3>Mutation with onBeforeRequest</h3>
        <div class="form-group">
          <label for="title">Post Title:</label>
          <input
            id="title"
            v-model="newPostTitle"
            type="text"
            placeholder="Enter post title"
          />

          <label for="body">Post Body:</label>
          <textarea
            id="body"
            v-model="newPostBody"
            rows="4"
            placeholder="Enter post content"
          ></textarea>

          <button
            @click="handleCreatePost"
            :disabled="isCreating || !newPostTitle || !newPostBody"
            class="primary-button"
          >
            {{ isCreating ? 'Creating...' : 'Create Post' }}
          </button>
        </div>

        <div v-if="createdPost" class="result-card">
          <h4>📝 Created Post</h4>
          <p><strong>ID:</strong> {{ createdPost.id }}</p>
          <p><strong>Title:</strong> {{ createdPost.title }}</p>
          <p><strong>Body:</strong> {{ createdPost.body }}</p>
        </div>

        <div class="info-box">
          <strong>Headers added for this mutation:</strong>
          <ul>
            <li>🌍 Global: <code>X-App-Name: Vue-API-Kit-Demo</code></li>
            <li>📋 Definition: <code>X-Content-Version: 2.0</code></li>
            <li>🎯 Runtime: <code>X-Session-Context: demo-session-123</code></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Logs Section -->
    <div class="logs-section">
      <div class="logs-header">
        <h3>📋 Request Logs</h3>
        <button @click="clearLogs" class="clear-button">Clear Logs</button>
      </div>
      <div class="logs-content">
        <div v-if="logs.length === 0" class="no-logs">
          No logs yet. Try loading a user or creating a post!
        </div>
        <div v-else class="log-list">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
      <div class="logs-tip">
        💡 <strong>Tip:</strong> Open browser DevTools Network tab to see actual headers sent with requests!
      </div>
    </div>
  </div>
</template>

<style scoped>
.onbeforerequest-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.demo-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.demo-section h3 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.input-group label {
  font-weight: 600;
  color: #495057;
}

.input-group input[type="number"] {
  width: 80px;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.input-group button,
.form-group button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.input-group button:hover:not(:disabled),
.form-group button:hover:not(:disabled) {
  background: #0056b3;
}

.input-group button:disabled,
.form-group button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 600;
  color: #495057;
  margin-top: 10px;
}

.form-group input,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.primary-button {
  padding: 10px 20px !important;
  background: #28a745 !important;
  margin-top: 10px;
}

.primary-button:hover:not(:disabled) {
  background: #218838 !important;
}

.result-card {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.result-card h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
}

.result-card p {
  margin: 5px 0;
  color: #495057;
}

.info-box {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #bee5eb;
}

.info-box strong {
  display: block;
  margin-bottom: 10px;
  color: #004085;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  margin: 5px 0;
  color: #004085;
}

.info-box code {
  background: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #d63384;
}

.logs-section {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.logs-header h3 {
  margin: 0;
  color: #2c3e50;
}

.clear-button {
  padding: 6px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.clear-button:hover {
  background: #c82333;
}

.logs-content {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
  min-height: 150px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

.no-logs {
  color: #6c757d;
  text-align: center;
  padding: 40px 20px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  color: #212529;
  border-left: 3px solid #007bff;
}

.logs-tip {
  background: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ffc107;
  color: #856404;
  font-size: 14px;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
