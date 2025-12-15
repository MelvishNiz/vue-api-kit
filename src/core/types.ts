import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { Ref } from "vue";
import type { ZodError, ZodType } from "zod";
import type { $ZodIssue } from "zod/v4/core";

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Infer<T> = T extends ZodType<infer U> ? U : any;

export interface ApiQuery<
  TParams extends ZodType<any> | undefined = ZodType<any> | undefined,
  TResponse extends ZodType<any> | undefined = ZodType<any> | undefined
> {
  method?: Extract<HTTPMethod, "GET">;
  path: string;
  params?: TParams;
  response?: TResponse;
}

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

export interface ApiClientOptions<
  Q extends Record<string, ApiQuery> = Record<string, ApiQuery>,
  M extends Record<string, ApiMutation> = Record<string, ApiMutation>
> {
  baseURL: string;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  queries?: Q;
  mutations?: M;
  beforeRequest?: (config: InternalAxiosRequestConfig<any>) => Promise<any> | any;
  onErrorRequest?: (error: { message: string; status?: number; code?: string, data?: any }) => void;
  onZodError?: (issues: Omit<$ZodIssue, "input">[]) => void;
}

export interface UseQueryOptions<TParams = any, TResult = any> {
  params?: TParams;
  loadOnMount?: boolean;
  debounce?: number;
  onResult?: (result: TResult) => void;
  onError?: (error: AxiosError | ZodError | Error) => void;
  onZodError?: (issues: Omit<$ZodIssue, "input">[]) => void;
}

export interface UseMutationOptions<TResult = any> {
  onResult?: (result: TResult) => void;
  onError?: (error: AxiosError | ZodError | Error) => void;
  onZodError?: (issues: Omit<$ZodIssue, "input">[]) => void;
  onUploadProgress?: (progress: number) => void;
}

export interface QueryResult<TResult> {
  result: Ref<TResult | undefined>;
  errorMessage: Ref<string | undefined>;
  zodErrors: Ref<Omit<$ZodIssue, "input">[] | undefined>;
  isLoading: Ref<boolean>;
  isDone: Ref<boolean>;
  refetch: () => Promise<void>;
}

export interface MutationResult<TResult, TData> {
  result: Ref<TResult | undefined>;
  errorMessage: Ref<string | undefined>;
  zodErrors: Ref<Omit<$ZodIssue, "input">[] | undefined>;
  isLoading: Ref<boolean>;
  isDone: Ref<boolean>;
  uploadProgress: Ref<number>;
  mutate: (data: TData & { params?: any }) => Promise<void>;
}
