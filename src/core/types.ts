import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { Ref } from "vue";
import type { ZodError, ZodType } from "zod";
import type { $ZodIssue } from "zod/v4/core";

/**
 * HTTP methods supported by the API client
 * @example
 * const method: HTTPMethod = "GET";
 */
export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * Infer TypeScript type from Zod schema
 * @template T - Zod schema type
 * @example
 * const userSchema = z.object({ id: z.number(), name: z.string() });
 * type User = Infer<typeof userSchema>; // { id: number; name: string }
 */
export type Infer<T> = T extends ZodType<infer U> ? U : any;

/**
 * Defines a query endpoint configuration (supports GET and POST methods)
 * @template TParams - Zod schema for query/path parameters
 * @template TData - Zod schema for request body (POST only)
 * @template TResponse - Zod schema for response data
 * @example
 * const getUsers: ApiQuery = {
 *   method: "GET",
 *   path: "/users",
 *   params: z.object({ page: z.number() }),
 *   response: z.array(z.object({ id: z.number(), name: z.string() }))
 * };
 * @example
 * const searchUsers: ApiQuery = {
 *   method: "POST",
 *   path: "/users/search",
 *   data: z.object({ query: z.string() }),
 *   response: z.array(z.object({ id: z.number(), name: z.string() }))
 * };
 */
export interface ApiQuery<
  TParams extends ZodType<any> | undefined = ZodType<any> | undefined,
  TData extends ZodType<any> | undefined = ZodType<any> | undefined,
  TResponse extends ZodType<any> | undefined = ZodType<any> | undefined
> {
  method?: Extract<HTTPMethod, "GET" | "POST">;
  path: string;
  params?: TParams;
  data?: TData;
  response?: TResponse;
}

/**
 * Defines a mutation (POST, PUT, PATCH, DELETE) endpoint configuration
 * @template TData - Zod schema for request body
 * @template TResponse - Zod schema for response data
 * @template TParams - Zod schema for path/query parameters
 * @example
 * const createUser: ApiMutation = {
 *   method: "POST",
 *   path: "/users",
 *   data: z.object({ name: z.string(), email: z.string().email() }),
 *   response: z.object({ id: z.number(), name: z.string(), email: z.string() })
 * };
 */
export interface ApiMutation<
  TData extends ZodType<any> | undefined = ZodType<any> | undefined,
  TResponse extends ZodType<any> | undefined = ZodType<any> | undefined,
  TParams extends ZodType<any> | undefined = ZodType<any> | undefined
> {
  method: HTTPMethod;
  path: string;
  params?: TParams;
  data?: TData;
  response?: TResponse;
  isMultipart?: boolean;
}

/**
 * Configuration options for creating an API client
 * @template Q - Record of query endpoint definitions
 * @template M - Record of mutation endpoint definitions
 * @example
 * const options: ApiClientOptions = {
 *   baseURL: "https://api.example.com",
 *   headers: { Authorization: "Bearer token" },
 *   queries: { getUsers: { path: "/users" } },
 *   mutations: { createUser: { method: "POST", path: "/users" } },
 *   onErrorRequest: (error) => console.error(error.message)
 * };
 */
export interface ApiClientOptions<
  Q extends Record<string, ApiQuery> = Record<string, ApiQuery>,
  M extends Record<string, ApiMutation> = Record<string, ApiMutation>
> {
  baseURL: string;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  queries?: Q;
  mutations?: M;
  onBeforeRequest?: (config: InternalAxiosRequestConfig<any>) => Promise<any> | void | any;
  onStartRequest?: () => Promise<void> | void | any;
  onFinishRequest?: () => Promise<void> | void | any;
  onErrorRequest?: (error: { message: string; status?: number; code?: string, data?: any }) => void;
  onZodError?: (issues: Omit<$ZodIssue, "input">[]) => void;
}

/**
 * Options for configuring a query hook
 * @template TParams - Type of query parameters
 * @template TData - Type of request body data (for POST queries)
 * @template TResult - Type of result data
 * @example
 * const options: UseQueryOptions = {
 *   params: { page: 1 },
 *   loadOnMount: true,
 *   debounce: 300,
 *   onResult: (data) => console.log(data),
 *   onError: (error) => console.error(error)
 * };
 * @example
 * const options: UseQueryOptions = {
 *   data: { query: "search term" },
 *   loadOnMount: true,
 *   onResult: (data) => console.log(data)
 * };
 */
export interface UseQueryOptions<TParams = any, TData = any, TResult = any> {
  params?: TParams;
  data?: TData;
  loadOnMount?: boolean;
  debounce?: number;
  onResult?: (result: TResult) => void;
  onError?: (error: AxiosError | ZodError | Error) => void;
  onZodError?: (issues: Omit<$ZodIssue, "input">[]) => void;
}

/**
 * Options for configuring a mutation hook
 * @template TResult - Type of result data
 * @example
 * const options: UseMutationOptions = {
 *   onResult: (data) => console.log("Success:", data),
 *   onError: (error) => console.error("Error:", error),
 *   onUploadProgress: (progress) => console.log(`Upload: ${progress}%`)
 * };
 */
export interface UseMutationOptions<TResult = any> {
  onResult?: (result: TResult) => void;
  onError?: (error: AxiosError | ZodError | Error) => void;
  onZodError?: (issues: Omit<$ZodIssue, "input">[]) => void;
  onUploadProgress?: (progress: number) => void;
}

/**
 * Return type from a query hook
 * @template TResult - Type of result data
 * @example
 * const { result, isLoading, errorMessage, refetch } = useGetUsers();
 * // result.value contains the data
 * // isLoading.value indicates loading state
 * // errorMessage.value contains any error message
 * // refetch() to manually trigger a new request
 * // uploadProgress.value shows upload progress (0-100) for POST queries with file uploads
 */
export interface QueryResult<TResult> {
  result: Ref<TResult | undefined>;
  errorMessage: Ref<string | undefined>;
  zodErrors: Ref<Omit<$ZodIssue, "input">[] | undefined>;
  isLoading: Ref<boolean>;
  isDone: Ref<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Return type from a mutation hook
 * @template TResult - Type of result data
 * @template TData - Type of mutation input data
 * @example
 * const { mutate, isLoading, result, errorMessage } = useCreateUser();
 * // Call mutate() to trigger the mutation
 * await mutate({ name: "John", email: "john@example.com" });
 * // result.value contains the response
 * // isLoading.value indicates loading state
 * // uploadProgress.value shows upload progress (0-100)
 */
export interface MutationResult<TResult, TData = any, TParams = any> {
  result: Ref<TResult | undefined>;
  errorMessage: Ref<string | undefined>;
  zodErrors: Ref<Omit<$ZodIssue, "input">[] | undefined>;
  isLoading: Ref<boolean>;
  isDone: Ref<boolean>;
  uploadProgress: Ref<number>;
  mutate: (rgs?: { data?: TData; params?: TParams }) => Promise<void>;
}
