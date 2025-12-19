<script setup lang="ts">
import { nestedApi, deepNestedApi } from '../examples/nested-api-example';

// Example 1: Using nested queries - Users
const { result: users, isLoading: usersLoading, errorMessage: usersError } = nestedApi.query.users.getAll();

// Example 2: Using nested queries - Posts
const { result: posts, isLoading: postsLoading } = nestedApi.query.posts.getAll({
  loadOnMount: true,
});

// Example 3: Using nested mutations - Create User
const {
  mutate: createUser,
  isLoading: creatingUser,
  result: createdUser,
  errorMessage: createUserError,
} = nestedApi.mutation.users.create({
  onResult: (user) => {
    console.log('User created:', user);
  },
});

// Example 4: Using nested mutations - Create Post
const {
  mutate: createPost,
  isLoading: creatingPost,
  result: createdPost,
} = nestedApi.mutation.posts.create();

// Example 5: Deep nesting
const { result: deepUsers, isLoading: deepUsersLoading } = deepNestedApi.query.api.v1.resources.users.list();

// Handlers
const handleCreateUser = async () => {
  await createUser({
    data: {
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
    },
  });
};

const handleCreatePost = async () => {
  await createPost({
    data: {
      userId: 1,
      title: 'My New Post',
      body: 'This is the content of my post.',
    },
  });
};
</script>

<template>
  <div class="nested-api-demo">
    <h2>🏗️ Nested Structure API Demo</h2>
    <p class="description">
      This demo showcases the new multi-level nested structure feature for organizing API endpoints.
    </p>

    <!-- Example 1: Users List -->
    <section class="demo-section">
      <h3>Example 1: Nested Queries - Users</h3>
      <p><code>nestedApi.query.users.getAll()</code></p>
      
      <div v-if="usersLoading" class="loading">Loading users...</div>
      <div v-else-if="usersError" class="error">Error: {{ usersError }}</div>
      <div v-else-if="users">
        <p class="success">✓ Loaded {{ users.length }} users</p>
        <details>
          <summary>Show users</summary>
          <ul class="items-list">
            <li v-for="user in users" :key="user.id">
              <strong>{{ user.name }}</strong> (@{{ user.username }}) - {{ user.email }}
            </li>
          </ul>
        </details>
      </div>
    </section>

    <!-- Example 2: Posts List -->
    <section class="demo-section">
      <h3>Example 2: Nested Queries - Posts</h3>
      <p><code>nestedApi.query.posts.getAll()</code></p>
      
      <div v-if="postsLoading" class="loading">Loading posts...</div>
      <div v-else-if="posts">
        <p class="success">✓ Loaded {{ posts.length }} posts</p>
        <details>
          <summary>Show posts (first 5)</summary>
          <ul class="items-list">
            <li v-for="post in posts.slice(0, 5)" :key="post.id">
              <strong>{{ post.title }}</strong>
              <p class="post-body">{{ post.body.substring(0, 100) }}...</p>
            </li>
          </ul>
        </details>
      </div>
    </section>

    <!-- Example 3: Create User Mutation -->
    <section class="demo-section">
      <h3>Example 3: Nested Mutations - Create User</h3>
      <p><code>nestedApi.mutation.users.create()</code></p>
      
      <button @click="handleCreateUser" :disabled="creatingUser" class="action-button">
        {{ creatingUser ? 'Creating...' : 'Create User' }}
      </button>
      
      <div v-if="createdUser" class="success">
        ✓ User created: {{ createdUser.name }} (ID: {{ createdUser.id }})
      </div>
      <div v-if="createUserError" class="error">Error: {{ createUserError }}</div>
    </section>

    <!-- Example 4: Create Post Mutation -->
    <section class="demo-section">
      <h3>Example 4: Nested Mutations - Create Post</h3>
      <p><code>nestedApi.mutation.posts.create()</code></p>
      
      <button @click="handleCreatePost" :disabled="creatingPost" class="action-button">
        {{ creatingPost ? 'Creating...' : 'Create Post' }}
      </button>
      
      <div v-if="createdPost" class="success">
        ✓ Post created: {{ createdPost.title }} (ID: {{ createdPost.id }})
      </div>
    </section>

    <!-- Example 5: Deep Nesting -->
    <section class="demo-section">
      <h3>Example 5: Deep Nesting (Multi-Level)</h3>
      <p><code>deepNestedApi.query.api.v1.resources.users.list()</code></p>
      
      <div v-if="deepUsersLoading" class="loading">Loading users...</div>
      <div v-else-if="deepUsers">
        <p class="success">✓ Loaded {{ deepUsers.length }} users from deeply nested API</p>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits-section">
      <h3>✨ Benefits of Nested Structure</h3>
      <ul class="benefits-list">
        <li><strong>Better Organization:</strong> Group related endpoints together</li>
        <li><strong>Namespace Separation:</strong> Avoid naming conflicts (users.create vs posts.create)</li>
        <li><strong>Improved Readability:</strong> Clear hierarchical structure</li>
        <li><strong>Scalability:</strong> Easy to add new endpoints without cluttering root level</li>
        <li><strong>Type Safety:</strong> Full TypeScript inference throughout nested structure</li>
        <li><strong>Backward Compatible:</strong> Works alongside existing flat structure</li>
      </ul>
    </section>

    <!-- Code Examples Section -->
    <section class="code-examples">
      <h3>💻 Code Examples</h3>
      
      <div class="code-block">
        <h4>Flat Structure (Old Way)</h4>
        <pre><code>queries: {
  getUsers: defineQuery({ path: '/users' }),
  getPosts: defineQuery({ path: '/posts' }),
  getUserById: defineQuery({ path: '/users/{id}' }),
  getPostById: defineQuery({ path: '/posts/{id}' })
}</code></pre>
      </div>

      <div class="code-block">
        <h4>Nested Structure (New Way)</h4>
        <pre><code>queries: {
  users: {
    getAll: defineQuery({ path: '/users' }),
    getById: defineQuery({ path: '/users/{id}' })
  },
  posts: {
    getAll: defineQuery({ path: '/posts' }),
    getById: defineQuery({ path: '/posts/{id}' })
  }
}</code></pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.nested-api-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  color: #42b883;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.demo-section {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.demo-section h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
}

.demo-section code {
  background: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #e96900;
}

.loading {
  color: #2c3e50;
  padding: 10px;
  font-style: italic;
}

.success {
  color: #42b883;
  padding: 10px;
  font-weight: 500;
}

.error {
  color: #f56c6c;
  padding: 10px;
  background: #fef0f0;
  border-radius: 4px;
  margin-top: 10px;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.items-list li {
  padding: 10px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.post-body {
  margin: 5px 0 0;
  color: #666;
  font-size: 14px;
}

.action-button {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
}

.action-button:hover:not(:disabled) {
  background: #35a372;
}

.action-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

details {
  margin-top: 10px;
  cursor: pointer;
}

summary {
  color: #42b883;
  font-weight: 500;
  padding: 8px;
  background: white;
  border-radius: 4px;
  user-select: none;
}

summary:hover {
  background: #f0f0f0;
}

.benefits-section {
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.benefits-section h3 {
  margin-top: 0;
  color: #2e7d32;
}

.benefits-list {
  list-style: none;
  padding: 0;
}

.benefits-list li {
  padding: 8px 0;
  color: #333;
}

.benefits-list li strong {
  color: #2e7d32;
}

.code-examples {
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.code-examples h3 {
  margin-top: 0;
  color: #333;
}

.code-block {
  margin-bottom: 20px;
}

.code-block h4 {
  margin-bottom: 10px;
  color: #555;
}

.code-block pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}
</style>
