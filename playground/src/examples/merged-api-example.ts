/**
 * Merged API Client Example
 * This file demonstrates how to merge queries and mutations from separate files
 * into a single, fully type-safe API client
 */

import { createApiClient, mergeQueries, mergeMutations } from '../../../dist';
import { userQueries, userMutations } from './user-api';
import { postQueries, postMutations } from './post-api';

// ============================================================================
// APPROACH 1: Merge queries and mutations separately, then create API client
// ============================================================================

export const api = createApiClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },

  // Merge all queries from different modules
  queries: mergeQueries(userQueries, postQueries),

  // Merge all mutations from different modules
  mutations: mergeMutations(userMutations, postMutations),

  // Global handlers
  onBeforeRequest: async (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  onErrorRequest: ({ message, status }) => {
    console.error(`API Error [${status}]: ${message}`);
  },
});

