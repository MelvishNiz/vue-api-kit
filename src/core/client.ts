import axios, { AxiosError, type AxiosProgressEvent } from "axios";
import { nextTick, ref, watch, onMounted, onBeforeUnmount } from "vue";
import z, { ZodError, type ZodType } from "zod";
import { debounce } from "lodash-es";
import type { ApiClientOptions, ApiMutation, ApiQuery, Infer, UseMutationOptions, UseQueryOptions, QueryHooksFromDefinitions, MutationHooksFromDefinitions, NestedStructure } from "./types";
import type { $ZodFlattenedError } from "zod/v4/core";

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

/**
 * Type guard to check if an object is an ApiQuery definition
 */
function isApiQuery(obj: any): obj is ApiQuery {
  return obj && typeof obj === 'object' && obj !== null && typeof obj.path === 'string';
}

/**
 * Type guard to check if an object is an ApiMutation definition
 */
function isApiMutation(obj: any): obj is ApiMutation {
  return obj && typeof obj === 'object' && obj !== null && typeof obj.path === 'string' && typeof obj.method === 'string';
}

/* -------------------------------------------------------------------------- */
/*                              CREATE API CLIENT                              */
/* -------------------------------------------------------------------------- */

/**
 * Creates a type-safe API client with query and mutation hooks for Vue 3
 * @template Q - Record of query endpoint definitions
 * @template M - Record of mutation endpoint definitions
 * @param {ApiClientOptions<Q, M>} options - Configuration options for the API client
 * @returns {Object} API client with query and mutation hooks
 * @example
 * import { createApiClient } from 'vue-api-kit';
 * import { z } from 'zod';
 *
 * const api = createApiClient({
 *   baseURL: 'https://jsonplaceholder.typicode.com',
 *   queries: {
 *     getUsers: {
 *       path: '/users',
 *       response: z.array(z.object({
 *         id: z.number(),
 *         name: z.string()
 *       }))
 *     }
 *   },
 *   mutations: {
 *     createUser: {
 *       method: 'POST',
 *       path: '/users',
 *       data: z.object({
 *         name: z.string(),
 *         email: z.string().email()
 *       }),
 *       response: z.object({
 *         id: z.number(),
 *         name: z.string(),
 *         email: z.string()
 *       })
 *     }
 *   }
 * });
 *
 * // In your Vue component:
 * const { result, isLoading } = api.query.getUsers();
 * const { mutate } = api.mutation.createUser();
 */
export function createApiClient<
  Q extends Record<string, NestedStructure<ApiQuery>>,
  M extends Record<string, NestedStructure<ApiMutation>>
>(options: ApiClientOptions<Q, M>): {
  query: QueryHooksFromDefinitions<Q>;
  mutation: MutationHooksFromDefinitions<M>;
} {
  const client = axios.create({
    baseURL: options.baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    withCredentials: options.withCredentials ?? false,
    withXSRFToken: options.withXSRFToken ?? false,
  });

  // CSRF refresh state to prevent race conditions
  let isRefreshingCsrf = false;
  let csrfRefreshPromise: Promise<void> | null = null;

  /* ------------------------- BEFORE REQUEST HANDLER ------------------------ */

  if (options.onBeforeRequest) {
    client.interceptors.request.use(
      async (config) => {
        try {
          const modifiedConfig = await options.onBeforeRequest!(config);
          return modifiedConfig || config;
        } catch (error) {
          return Promise.reject(error);
        }
      },
      (error) => Promise.reject(error)
    );
  }

  /* ----------------------------- LOADING HANDLER --------------------------- */

  if (options.onStartRequest) {
    client.interceptors.request.use(
      async (config) => {
        try {
          await options.onStartRequest!();
          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      },
      (error) => Promise.reject(error)
    );
  }

  if (options.onFinishRequest) {
    client.interceptors.response.use(
      (response) => {
        options.onFinishRequest!();
        return response;
      },
      (error) => {
        options.onFinishRequest!();
        return Promise.reject(error);
      }
    );
  }


  /* --------------------------- PATH PARAM HANDLER -------------------------- */

  client.interceptors.request.use((config) => {
    if (!config.url) return config;

    const replaceParams = (obj?: Record<string, any>) => {
      if (!obj) return;

      for (const [key, value] of Object.entries(obj)) {
        const token = `{${key}}`;
        if (config.url!.includes(token)) {
          config.url = config.url!.replace(
            token,
            encodeURIComponent(String(value))
          );
          delete obj[key];
        }
      }
    };

    if (config.method !== "get" && config.data?.params) {
      replaceParams(config.data.params);
    }

    replaceParams(config.params);
    return config;
  });

  /* ----------------------------- CSRF REFRESH ------------------------------ */

  if (options.csrfRefreshEndpoint) {
    client.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Prevent infinite loop: don't retry CSRF refresh endpoint itself
        if (originalRequest?.url === options.csrfRefreshEndpoint) {
          return Promise.reject(error);
        }

        // Check if error is CSRF related (403 or 419 status codes)
        if (
          error.response &&
          (error.response.status === 403 || error.response.status === 419) &&
          !originalRequest?._retry
        ) {
          originalRequest._retry = true;

          try {
            // Prevent race condition: reuse existing refresh promise if already refreshing
            if (isRefreshingCsrf && csrfRefreshPromise) {
              await csrfRefreshPromise;
            } else {
              isRefreshingCsrf = true;
              csrfRefreshPromise = client.get(options.csrfRefreshEndpoint!).then(() => {
                isRefreshingCsrf = false;
                csrfRefreshPromise = null;
              });
              await csrfRefreshPromise;
            }

            // Retry the original request with fresh CSRF token
            return client.request(originalRequest);
          } catch (refreshError) {
            isRefreshingCsrf = false;
            csrfRefreshPromise = null;
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /* ----------------------------- RESPONSE ERROR ---------------------------- */

  client.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      nextTick(() => {
        if (error.code === "ERR_CANCELED") return;
      });
      return Promise.reject(error);
    }
  );

  /* -------------------------------------------------------------------------- */
  /*                                   QUERIES                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Recursively create query hooks for nested structures
   */
  function createQueryHooks<T extends Record<string, NestedStructure<ApiQuery>>>(
    queriesDef: T
  ): QueryHooksFromDefinitions<T> {
    const result = {} as any;

    for (const key in queriesDef) {
      const value = queriesDef[key];
      if (!value) continue;

      // Check if it's an ApiQuery or a nested structure
      if (isApiQuery(value)) {
        const q = value as ApiQuery;

        result[key] = (paramsOrOptions?: any) => {
          // Support both direct params and options object
          let queryOptions: UseQueryOptions<any> | undefined;
          if (paramsOrOptions && typeof paramsOrOptions === 'object') {
            // Check if it's options object (has callbacks or config) or direct params
            const hasOptionsProps = 'loadOnMount' in paramsOrOptions ||
                                    'debounce' in paramsOrOptions ||
                                    'onResult' in paramsOrOptions ||
                                    'onError' in paramsOrOptions ||
                                    'onZodError' in paramsOrOptions ||
                                    'onBeforeRequest' in paramsOrOptions ||
                                    'params' in paramsOrOptions ||
                                    'data' in paramsOrOptions;
            if (hasOptionsProps) {
              queryOptions = paramsOrOptions;
            } else {
              // Direct params
              queryOptions = { params: paramsOrOptions };
            }
          }

          const data = ref<any>();
          const errorMessage = ref<string | undefined>();
          const zodError = ref<$ZodFlattenedError<any, any> | undefined>();
          const isLoading = ref(false);
          const isDone = ref(false);
          const isFirstLoad = ref(true);
          let abortController = new AbortController();

          const cancel = () => {
            abortController?.abort();
            abortController = new AbortController();
          };

          const refetch = async () => {
            if (isLoading.value) {
              cancel();
            }
            isLoading.value = true;
            errorMessage.value = undefined;

            try {
              if (q.params && queryOptions?.params) {
                (q.params as ZodType<any>).parse(queryOptions.params);
              }

              // Prepare request data for POST queries
              let requestData = queryOptions?.data;

              // Validate data with Zod if schema is provided
              if (q.data && requestData) {
                (q.data as ZodType<any>).parse(requestData);
              }

              const requestConfig: any = {
                method: q.method ?? "GET",
                url: q.path,
                params: queryOptions?.params,
                signal: abortController.signal,
              };

              // Only add data for POST queries
              if (q.method === "POST" && requestData) {
                requestConfig.data = requestData;
              }

              // Apply query-level onBeforeRequest hook
              if (q.onBeforeRequest) {
                const modifiedConfig = await q.onBeforeRequest(requestConfig);
                // If a new config is returned, use it; otherwise the hook modified in-place
                if (modifiedConfig !== undefined) {
                  Object.assign(requestConfig, modifiedConfig);
                }
              }

              // Apply options-level onBeforeRequest hook
              if (queryOptions?.onBeforeRequest) {
                const modifiedConfig = await queryOptions.onBeforeRequest(requestConfig);
                // If a new config is returned, use it; otherwise the hook modified in-place
                if (modifiedConfig !== undefined) {
                  Object.assign(requestConfig, modifiedConfig);
                }
              }

              // Reset Error state on success
              errorMessage.value = undefined;
              zodError.value = undefined;

              const res = await client.request(requestConfig);

              const parsedData = q.response
                ? (q.response as ZodType<any>).parse(res.data)
                : res.data;

              data.value = parsedData;
              queryOptions?.onResult?.(parsedData);
            } catch (err: any) {
              if (err instanceof AxiosError) {
                if (err.code !== "ERR_CANCELED") {
                  const message = err.response?.data?.message || err.message || "An error occurred";
                  errorMessage.value = message;

                  // Call local error handler
                  queryOptions?.onError?.(err);

                  // Call global error handler
                  options.onError?.({ err, message });
                }
              } else if (err instanceof ZodError) {
                // Handle Zod validation errors
                zodError.value = z.flattenError(err);
                const length = Object.keys(zodError.value.fieldErrors).length;
                const message = `${Object.values(zodError.value.fieldErrors).at(0)}.${length > 1 ? ` (and ${length - 1} more errors)` : ''}`;
                errorMessage.value = message;

                // Call local error handler with formatted validation errors
                queryOptions?.onError?.(err);

                // Call local Zod error handler
                queryOptions?.onZodError?.(z.flattenError(err));

                // Call global error handler
                options.onError?.({ err, message });

                // Call global Zod error handler
                if (options.onZodError) {
                  options.onZodError(z.flattenError(err));
                }
              } else {
                const message = err.message || "An error occurred";
                errorMessage.value = message;
                queryOptions?.onError?.(message);
                options.onError?.({ err, message });
              }
            } finally {
              isLoading.value = false;
              isDone.value = true;
            }
          };

          const debouncedRefetch = queryOptions?.debounce
            ? debounce(refetch, queryOptions.debounce)
            : refetch;

          let stopWatcher: (() => void) | null = null;

          if (queryOptions?.params || queryOptions?.data) {
            onMounted(() => {
              if (stopWatcher) stopWatcher();
              stopWatcher = watch(
                () => JSON.stringify({ params: queryOptions.params, data: queryOptions.data }),
                () => {
                  debouncedRefetch();
                },
                { immediate: false }
              );
            });
            onBeforeUnmount(() => {
              if (stopWatcher) stopWatcher();
              abortController?.abort();
            });
          }

          if ((queryOptions?.loadOnMount === undefined || queryOptions.loadOnMount) && !isDone.value) {
            if (isFirstLoad.value) {
              isFirstLoad.value = false;
              refetch();
            } else {
              debouncedRefetch();
            }
          }

          return { result: data, errorMessage, zodError, isLoading, isDone, refetch };
        };
      } else if (typeof value === 'object') {
        // It's a nested structure, recurse
        result[key] = createQueryHooks(value);
      }
    }

    return result;
  }

  const queriesDef = options.queries ?? ({} as Q);
  const useQueries = createQueryHooks(queriesDef);

  /* -------------------------------------------------------------------------- */
  /*                                 MUTATIONS                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Recursively create mutation hooks for nested structures
   */
  function createMutationHooks<T extends Record<string, NestedStructure<ApiMutation>>>(
    mutationsDef: T
  ): MutationHooksFromDefinitions<T> {
    const result = {} as any;

    for (const key in mutationsDef) {
      const value = mutationsDef[key];
      if (!value) continue;

      // Check if it's an ApiMutation or a nested structure
      if (isApiMutation(value)) {
        const m = value as ApiMutation;

        result[key] = (mutationOptions?: UseMutationOptions) => {
          const data = ref<any>();
          const errorMessage = ref<string | undefined>();
          const zodError = ref<$ZodFlattenedError<any, any> | undefined>();
          const isLoading = ref(false);
          const isDone = ref(false);
          const uploadProgress = ref(0);

          const mutate = async (
            args?: {
              data?: Infer<typeof m.data>;
              params?: Infer<typeof m.params>;
            }
          ) => {
            if (isLoading.value) return;
            isLoading.value = true;
            errorMessage.value = undefined;
            uploadProgress.value = 0;

            try {
              // Extract params if exists
              const { data: dataWithoutParams = {}, params } = args ?? {};

              // Prepare request data
              let requestData: any = dataWithoutParams ?? {};
              let headers: Record<string, string> = {};

              // Handle multipart/form-data for file uploads
              if (m.isMultipart) {
                const formData = new FormData();

                for (const [key, value] of Object.entries(dataWithoutParams)) {
                  if (value instanceof File || value instanceof Blob) {
                    formData.append(key, value);
                  } else if (Array.isArray(value)) {
                    // Handle array of files
                    value.forEach((item) => {
                      if (item instanceof File || item instanceof Blob) {
                        formData.append(key, item);
                      } else {
                        formData.append(key, JSON.stringify(item));
                      }
                    });
                  } else if (typeof value === 'object' && value !== null) {
                    formData.append(key, JSON.stringify(value));
                  } else {
                    formData.append(key, String(value));
                  }
                }

                requestData = formData;
                headers['Content-Type'] = 'multipart/form-data';
              } else if (m.data) {
                // Validate data with Zod for non-multipart requests
                (m.data as ZodType<any>).parse(dataWithoutParams);
              }

              if (m.params && params) {
                (m.params as ZodType<any>).parse(params);
              }

              const requestConfig: any = {
                method: m.method,
                url: m.path,
                data: requestData,
                params: params,
                headers,
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                  if (progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    uploadProgress.value = progress;
                    mutationOptions?.onUploadProgress?.(progress);
                  }
                },
              };

              // Apply mutation-level onBeforeRequest hook
              if (m.onBeforeRequest) {
                const modifiedConfig = await m.onBeforeRequest(requestConfig);
                // If a new config is returned, use it; otherwise the hook modified in-place
                if (modifiedConfig !== undefined) {
                  Object.assign(requestConfig, modifiedConfig);
                }
              }

              // Apply options-level onBeforeRequest hook
              if (mutationOptions?.onBeforeRequest) {
                const modifiedConfig = await mutationOptions.onBeforeRequest(requestConfig);
                // If a new config is returned, use it; otherwise the hook modified in-place
                if (modifiedConfig !== undefined) {
                  Object.assign(requestConfig, modifiedConfig);
                }
              }

              // Reset Error state on success
              errorMessage.value = undefined;
              zodError.value = undefined;

              const res = await client.request(requestConfig);

              const parsedData = m.response
                ? (m.response as ZodType<any>).parse(res.data)
                : res.data;

              data.value = parsedData;
              mutationOptions?.onResult?.(parsedData);
            } catch (err: any) {
              if (err instanceof AxiosError) {
                const message = err.response?.data?.message || err.message || "An error occurred";
                errorMessage.value = message;

                // Call local error handler
                mutationOptions?.onError?.(err);

                // Call global error handler
                options.onError?.({ err, message });
              } else if (err instanceof ZodError) {
                // Handle Zod validation errors
                zodError.value = z.flattenError(err);
                const length = Object.keys(zodError.value.fieldErrors).length;
                const message = `${Object.values(zodError.value.fieldErrors).at(0)}.${length > 1 ? ` (and ${length - 1} more errors)` : ''}`;
                errorMessage.value = message;

                // Call local error handler with formatted validation errors
                mutationOptions?.onError?.(err);

                // Call local Zod error handler
                mutationOptions?.onZodError?.(z.flattenError(err));

                // Call global error handler
                options.onError?.({ err, message });

                // Call global Zod error handler
                if (options.onZodError) {
                  options.onZodError(z.flattenError(err));
                }
              } else {
                const message = err.message || "An error occurred";
                errorMessage.value = message;
                mutationOptions?.onError?.(err);
                options.onError?.({ err, message });
              }
            } finally {
              isLoading.value = false;
              isDone.value = true;
            }
          };

          return { result: data, errorMessage, zodError, isLoading, isDone, uploadProgress, mutate };
        };
      } else if (typeof value === 'object') {
        // It's a nested structure, recurse
        result[key] = createMutationHooks(value);
      }
    }

    return result;
  }

  const mutationsDef = options.mutations ?? ({} as M);
  const useMutations = createMutationHooks(mutationsDef);

  /* -------------------------------------------------------------------------- */

  return {
    query: useQueries,
    mutation: useMutations,
  };
}
