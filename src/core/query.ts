import { onBeforeUnmount, onMounted, ref, type Ref, watch } from "vue";
import pkg from "lodash";
import { type ApiResponse, type QueryRequest, type UseQueryOption, type UseQueryResult } from "./types";
import { AxiosError } from "axios";

const {debounce} = pkg;

const query = <T, P>(request: QueryRequest<T, P>, options?: UseQueryOption<T, P>): UseQueryResult<T> => {
  const isFirstLoad = ref(true);
  const result = ref<T | undefined>() as Ref<T | undefined>;
  const isLoading = ref(false);
  const error = ref<string | undefined>();
  const isDone = ref(false);
  let abortController: AbortController = new AbortController();

  const cancel = () => {
    abortController?.abort();
    abortController = new AbortController();
  };

  const refetch = async () => {
    if (isLoading.value) {
      cancel();
    }
    isLoading.value = true;
    error.value = undefined;

    try {
      const {data} = await request({
        params: options?.params,
        signal: abortController.signal,
      });
      result.value = data;
      options?.onData?.(data);
    } catch (err: AxiosError | unknown) {
      if (err instanceof AxiosError) {
        const data = err.response?.data as ApiResponse;
        console.log(err);
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

  const debouncedLoad = options?.debounce ? debounce(refetch, options.debounce) : refetch;

  let stopWatcher: CallableFunction | null = null;

  if (options?.params) {
    onMounted(() => {
      if (stopWatcher) stopWatcher();
      stopWatcher = watch(
        () => JSON.stringify(options.params),
        () => {
          debouncedLoad();
        },
      );
    });
    onBeforeUnmount(() => {
      if (stopWatcher) stopWatcher();
      abortController?.abort();
    });
  }

  if ((options?.loadOnMount === undefined || options.loadOnMount) && !isDone.value) {
    if (isFirstLoad.value) {
      isFirstLoad.value = false;
      refetch();
    } else {
      debouncedLoad();
    }
  }

  return {result, error, refetch, isDone, isLoading};
};

export default query;