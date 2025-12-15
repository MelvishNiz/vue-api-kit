import { type AxiosResponse } from "axios";
import { type Ref } from "vue";

export type QueryRequest<T, P> = ({params, signal}: {params?: P; signal?: AbortSignal}) => Promise<AxiosResponse<T>>;
export type MutationRequest<T, P> = ({params}: {params?: P}) => Promise<AxiosResponse<T>>;
export type Callback<T> = (data: T) => void;
export type ErrorCallback = (error: string) => void;
export type ErrorValidationCallback = (errors: ApiValidationError[]) => void;
export interface ApiValidationError {
  field: string;
  message: string;
}
export interface ApiPagination {
  current_page: number;
  from: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  last_page: number;
  page_size: number;
  to: number;
  total: number;
}
export interface ApiPaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    validation_errors?: ApiValidationError[];
    pagination?: ApiPagination;
  };
}

export interface UseQueryOption<T, PARAMS = unknown> {
  /**
   * Whether to load the query on mount.
   * @default true
   */
  loadOnMount?: boolean;
  params?: PARAMS;
  onData?: Callback<T>;
  onError?: ErrorCallback;
  onValidationError?: ErrorValidationCallback;
  /**
   * Debounce time in milliseconds.
   * @default undefined
   */
  debounce?: number;
}
export interface UseMutationOption<T, PARAMS = unknown, BODY = unknown> {
  body?: BODY;
  params?: PARAMS;
  onData?: Callback<T>;
  onError?: ErrorCallback;
  onValidationError?: ErrorValidationCallback;
}
export interface UseQueryResult<T> {
  result: Ref<T | undefined>;
  error: Ref<string | undefined>;
  isLoading: Ref<boolean>;
  isDone: Ref<boolean>;
  refetch: () => Promise<void>;
}
export interface UseMutationResult<T> {
  result: Ref<T | undefined>;
  error: Ref<string | undefined>;
  isLoading: Ref<boolean>;
  isDone: Ref<boolean>;
  execute: (data?: Record<string, unknown>) => Promise<void>;
}