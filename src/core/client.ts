import axios, { AxiosError } from "axios";
import { nextTick, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { ZodError, type ZodType } from "zod";
import { debounce } from "lodash-es";
import type { ApiClientOptions, ApiMutation, ApiQuery, Infer, MutationResult, QueryResult, UseMutationOptions, UseQueryOptions } from "./types";
import type { $ZodIssue } from "zod/v4/core";

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
  Q extends Record<string, ApiQuery>,
  M extends Record<string, ApiMutation>
>(options: ApiClientOptions<Q, M>) {
  const client = axios.create({
    baseURL: options.baseURL,
    ...options.headers && { headers: options.headers },
    withCredentials: options.withCredentials ?? false,
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
        if (originalRequest.url === options.csrfRefreshEndpoint) {
          return Promise.reject(error);
        }

        // Check if error is CSRF related (403 or 419 status codes)
        if (
          error.response &&
          (error.response.status === 403 || error.response.status === 419) &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // Prevent race condition: reuse existing refresh promise if already refreshing
            if (isRefreshingCsrf && csrfRefreshPromise) {
              await csrfRefreshPromise;
            } else {
              isRefreshingCsrf = true;
              csrfRefreshPromise = client.get(options.csrfRefreshEndpoint!, {
                // Mark this request to prevent retry
                _skipRetry: true
              } as any).then(() => {
                isRefreshingCsrf = false;
                csrfRefreshPromise = null;
              });
              await csrfRefreshPromise;
            }

            // Retry the original request with fresh CSRF token
            return client(originalRequest);
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
  const queriesDef = options.queries ?? ({} as Q);
  const useQueries = {} as {
    [K in keyof Q]: (
      options?: UseQueryOptions<Infer<Q[K]["params"]>, Infer<Q[K]["data"]>, Infer<Q[K]["response"]>>
    ) => QueryResult<Infer<Q[K]["response"]>>;
  };

  for (const key in queriesDef) {
    const q = queriesDef[key];
    if (!q) continue;

    useQueries[key] = (paramsOrOptions?: any) => {
      // Support both direct params and options object
      let queryOptions: UseQueryOptions<any> | undefined;
      if (paramsOrOptions && typeof paramsOrOptions === 'object') {
        // Check if it's options object (has callbacks or config) or direct params
        const hasOptionsProps = 'loadOnMount' in paramsOrOptions ||
                                'debounce' in paramsOrOptions ||
                                'onResult' in paramsOrOptions ||
                                'onError' in paramsOrOptions ||
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
      const zodErrors = ref<Omit<$ZodIssue, "input">[] | undefined>();
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
              const status = err.response?.status;
              const code = err.code;
              const data = err.response?.data;
              errorMessage.value = message;

              // Call local error handler
              queryOptions?.onError?.(err);

              // Call global error handler
              options.onErrorRequest?.({ message, status, code, data });
            }
          } else if (err instanceof ZodError) {
            // Handle Zod validation errors
            zodErrors.value = err.issues || [];
            const validationMessages = zodErrors.value.map((e: any) =>
              `${e.path.join('.')}: ${e.message}`
            ).join(', ');
            const message = `Validation error: ${validationMessages}`;
            errorMessage.value = message;

            // Call local error handler with formatted validation errors
            queryOptions?.onError?.(err);

            // Call local Zod error handler
            queryOptions?.onZodError?.(zodErrors.value);

            // Call global error handler
            options.onErrorRequest?.({ message, code: 'VALIDATION_ERROR' });

            // Call global Zod error handler
            if (options.onZodError) {
              options.onZodError(zodErrors.value);
            }
          } else {
            const message = err.message || "An error occurred";
            errorMessage.value = message;
            queryOptions?.onError?.(message);
            options.onErrorRequest?.({ message });
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

      return { result: data, errorMessage, zodErrors, isLoading, isDone, refetch };
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                 MUTATIONS                                  */
  /* -------------------------------------------------------------------------- */
  const mutationsDef = options.mutations ?? ({} as M);
  const useMutations = {} as {
    [K in keyof M]: (
      options?: UseMutationOptions<Infer<M[K]["response"]>>
    ) => MutationResult<Infer<M[K]["response"]>, Infer<M[K]["data"]>, Infer<M[K]["params"]>>;
  };

  for (const key in mutationsDef) {
    const m = mutationsDef[key];
    if (!m) continue;

    useMutations[key] = (mutationOptions?: UseMutationOptions) => {
      const data = ref<any>();
      const errorMessage = ref<string | undefined>();
      const zodErrors = ref<Omit<$ZodIssue, "input">[] | undefined>();
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

          const res = await client.request({
            method: m.method,
            url: m.path,
            data: requestData,
            params: params,
            headers,
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                uploadProgress.value = progress;
                mutationOptions?.onUploadProgress?.(progress);
              }
            },
          });

          const parsedData = m.response
            ? (m.response as ZodType<any>).parse(res.data)
            : res.data;

          data.value = parsedData;
          mutationOptions?.onResult?.(parsedData);
        } catch (err: any) {
          if (err instanceof AxiosError) {
            const message = err.response?.data?.message || err.message || "An error occurred";
            const status = err.response?.status;
            const code = err.code;
            errorMessage.value = message;

            // Call local error handler
            mutationOptions?.onError?.(err);

            // Call global error handler
            options.onErrorRequest?.({ message, status, code });
          } else if (err instanceof ZodError) {
            // Handle Zod validation errors
            zodErrors.value = err.issues || [];
            const validationMessages = zodErrors.value.map((e: any) =>
              `${e.path.join('.')}: ${e.message}`
            ).join(', ');
            const message = `Validation error: ${validationMessages}`;
            errorMessage.value = message;

            // Call local error handler with formatted validation errors
            mutationOptions?.onError?.(err);

            // Call local Zod error handler
            mutationOptions?.onZodError?.(zodErrors.value);

            // Call global error handler
            options.onErrorRequest?.({ message, code: 'VALIDATION_ERROR' });

            // Call global Zod error handler
            if (options.onZodError) {
              options.onZodError(zodErrors.value);
            }
          } else {
            const message = err.message || "An error occurred";
            errorMessage.value = message;
            mutationOptions?.onError?.(err);
            options.onErrorRequest?.({ message });
          }
        } finally {
          isLoading.value = false;
          isDone.value = true;
        }
      };

      return { result: data, errorMessage, zodErrors, isLoading, isDone, uploadProgress, mutate };
    };
  }

  /* -------------------------------------------------------------------------- */

  return {
    query: useQueries,
    mutation: useMutations,
  };
}
