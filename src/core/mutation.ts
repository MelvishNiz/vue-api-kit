import { AxiosError } from "axios";
import { type ApiResponse, type MutationRequest, type UseMutationOption, type UseMutationResult } from "./types";
import { ref, type Ref } from "vue";

const mutation = <T, P, B>(
  request: MutationRequest<T, P>,
  options?: UseMutationOption<T, P, B>,
): UseMutationResult<T> => {
  const result = ref<T | undefined>() as Ref<T | undefined>;
  const isLoading = ref(false);
  const error = ref<string | undefined>();
  const isDone = ref(false);

  const execute = async () => {
    if (isLoading.value) return;
    isLoading.value = true;
    error.value = undefined;

    try {
      const {data} = await request({
        ...(options?.body ? options.body : {}),
        params: options?.params,
      });
      result.value = data;
      options?.onData?.(data);
    } catch (err: AxiosError | unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiResponse;
        if (err.name !== "AbortError") {
          const message = data.message || err.message || "An unknown error occurred.";
          error.value = message;
          options?.onError?.(message);
        }
        if (err.status === 422) {
          options?.onValidationError?.(data.meta?.validation_errors || []);
        }
      }
    } finally {
      isLoading.value = false;
      isDone.value = true;
    }
  };

  return {result, error, execute, isDone, isLoading};
};

export default mutation;