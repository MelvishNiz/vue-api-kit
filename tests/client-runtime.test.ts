import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { createApiClient } from "../src/core/client";
import axios, { AxiosError } from "axios";
import { nextTick } from "vue";

vi.mock("axios");
vi.mock("vue", async () => {
  const actual = await vi.importActual("vue");
  return {
    ...actual,
    nextTick: vi.fn((cb) => Promise.resolve().then(cb)),
  };
});

describe("createApiClient - Runtime Behavior", () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = Object.assign(
      vi.fn().mockResolvedValue({ data: "retry success" }),
      {
        request: vi.fn(),
        get: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }
    );
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Interceptors - onBeforeRequest", () => {
    it("should call onBeforeRequest interceptor and modify config", async () => {
      const onBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Custom": "value" };
        return config;
      });

      let requestInterceptor: any;
      let callCount = 0;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (success: any) => {
          if (callCount === 0) {
            requestInterceptor = success;
            callCount++;
          }
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        onBeforeRequest,
        queries: {},
      });

      const config = { headers: {} };
      const result = await requestInterceptor(config);

      expect(onBeforeRequest).toHaveBeenCalledWith(config);
      expect(result).toBeDefined();
    });

    it("should handle error in onBeforeRequest", async () => {
      const onBeforeRequest = vi.fn(() => {
        throw new Error("Request error");
      });

      let requestInterceptor: any;
      let callCount = 0;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (success: any) => {
          if (callCount === 0) {
            requestInterceptor = success;
            callCount++;
          }
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        onBeforeRequest,
        queries: {},
      });

      const config = { headers: {} };
      try {
        await requestInterceptor(config);
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toBe("Request error");
      }
    });
  });

  describe("Interceptors - onStartRequest", () => {
    it("should call onStartRequest interceptor", async () => {
      const onStartRequest = vi.fn();

      let requestInterceptor: any;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (success: any, error: any) => {
          if (!requestInterceptor) requestInterceptor = success;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        onStartRequest,
        queries: {},
      });

      const config = { headers: {} };
      await requestInterceptor(config);

      expect(onStartRequest).toHaveBeenCalled();
    });

    it("should handle error in onStartRequest", async () => {
      const onStartRequest = vi.fn(() => {
        throw new Error("Start error");
      });

      let requestInterceptor: any;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (success: any) => {
          if (!requestInterceptor) requestInterceptor = success;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        onStartRequest,
        queries: {},
      });

      const config = { headers: {} };
      await expect(requestInterceptor(config)).rejects.toThrow("Start error");
    });
  });

  describe("Interceptors - onFinishRequest", () => {
    it("should call onFinishRequest on success", async () => {
      const onFinishRequest = vi.fn();

      let responseInterceptor: any;
      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (!responseInterceptor) responseInterceptor = { success, error };
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        onFinishRequest,
        queries: {},
      });

      const response = { data: {}, status: 200 };
      await responseInterceptor.success(response);

      expect(onFinishRequest).toHaveBeenCalled();
    });

    it("should call onFinishRequest on error", async () => {
      const onFinishRequest = vi.fn();

      let responseInterceptor: any;
      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (!responseInterceptor) responseInterceptor = { success, error };
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        onFinishRequest,
        queries: {},
      });

      const error = new Error("Request failed");
      await expect(responseInterceptor.error(error)).rejects.toThrow();
      expect(onFinishRequest).toHaveBeenCalled();
    });
  });

  describe("Interceptors - Path Parameters", () => {
    it("should replace path parameters from params object", () => {
      let pathParamInterceptor: any;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (interceptor: any) => {
          pathParamInterceptor = interceptor;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        queries: {},
      });

      const config = {
        url: "/users/{id}/posts/{postId}",
        params: { id: 123, postId: 456, page: 1 },
      };

      pathParamInterceptor(config);

      expect(config.url).toBe("/users/123/posts/456");
      expect(config.params).toEqual({ page: 1 });
    });

    it("should replace path parameters from data.params for non-GET requests", () => {
      let pathParamInterceptor: any;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (interceptor: any) => {
          pathParamInterceptor = interceptor;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        queries: {},
      });

      const config = {
        url: "/users/{id}",
        method: "post",
        data: {
          params: { id: 999 },
          name: "John",
        },
      };

      pathParamInterceptor(config);

      expect(config.url).toBe("/users/999");
      expect(config.data.params).toEqual({});
    });

    it("should handle config without url", () => {
      let pathParamInterceptor: any;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (interceptor: any) => {
          pathParamInterceptor = interceptor;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        queries: {},
      });

      const config = { params: { id: 123 } };
      const result = pathParamInterceptor(config);

      expect(result).toEqual(config);
    });

    it("should encode special characters in path parameters", () => {
      let pathParamInterceptor: any;
      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (interceptor: any) => {
          pathParamInterceptor = interceptor;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        queries: {},
      });

      const config = {
        url: "/users/{email}",
        params: { email: "user@example.com" },
      };

      pathParamInterceptor(config);

      expect(config.url).toBe("/users/user%40example.com");
    });
  });

  describe("Interceptors - CSRF Refresh", () => {
    it("should handle CSRF 403 error and retry request", async () => {
      const csrfRefreshEndpoint = "/sanctum/csrf-cookie";
      let csrfInterceptor: any;
      let callCount = 0;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (callCount === 0 && error) {
            csrfInterceptor = error;
            callCount++;
          }
        }
      );

      mockAxiosInstance.get.mockResolvedValueOnce({ data: "csrf refreshed" });
      mockAxiosInstance.request.mockResolvedValueOnce({ data: "retry success" });

      createApiClient({
        baseURL: "https://api.example.com",
        csrfRefreshEndpoint,
        queries: {},
      });

      const error = {
        response: { status: 403 },
        config: { url: "/api/users", _retry: false },
      } as AxiosError;

      await csrfInterceptor(error);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(csrfRefreshEndpoint);
    });

    it("should handle CSRF 419 error and retry request", async () => {
      const csrfRefreshEndpoint = "/sanctum/csrf-cookie";
      let csrfInterceptor: any;
      let callCount = 0;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (callCount === 0 && error) {
            csrfInterceptor = error;
            callCount++;
          }
        }
      );

      mockAxiosInstance.get.mockResolvedValueOnce({ data: "csrf refreshed" });
      mockAxiosInstance.request.mockResolvedValueOnce({ data: "retry success" });

      createApiClient({
        baseURL: "https://api.example.com",
        csrfRefreshEndpoint,
        queries: {},
      });

      const error = {
        response: { status: 419 },
        config: { url: "/api/users", _retry: false },
      } as AxiosError;

      await csrfInterceptor(error);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(csrfRefreshEndpoint);
    });

    it("should not retry if already retried (_retry flag)", async () => {
      const csrfRefreshEndpoint = "/sanctum/csrf-cookie";
      let csrfInterceptor: any;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (error && !csrfInterceptor) csrfInterceptor = error;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        csrfRefreshEndpoint,
        queries: {},
      });

      const error = {
        response: { status: 403 },
        config: { url: "/api/users", _retry: true },
      } as AxiosError;

      await expect(csrfInterceptor(error)).rejects.toEqual(error);
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("should not retry CSRF endpoint itself to prevent infinite loop", async () => {
      const csrfRefreshEndpoint = "/sanctum/csrf-cookie";
      let csrfInterceptor: any;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (error && !csrfInterceptor) csrfInterceptor = error;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        csrfRefreshEndpoint,
        queries: {},
      });

      const error = {
        response: { status: 403 },
        config: { url: csrfRefreshEndpoint },
      } as AxiosError;

      await expect(csrfInterceptor(error)).rejects.toEqual(error);
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("should handle non-CSRF errors without retry", async () => {
      const csrfRefreshEndpoint = "/sanctum/csrf-cookie";
      let csrfInterceptor: any;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (error && !csrfInterceptor) csrfInterceptor = error;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        csrfRefreshEndpoint,
        queries: {},
      });

      const error = {
        response: { status: 404 },
        config: { url: "/api/users" },
      } as AxiosError;

      await expect(csrfInterceptor(error)).rejects.toEqual(error);
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("should handle errors without response object", async () => {
      const csrfRefreshEndpoint = "/sanctum/csrf-cookie";
      let csrfInterceptor: any;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (error && !csrfInterceptor) csrfInterceptor = error;
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        csrfRefreshEndpoint,
        queries: {},
      });

      const error = {
        config: { url: "/api/users" },
        message: "Network Error",
      } as AxiosError;

      await expect(csrfInterceptor(error)).rejects.toEqual(error);
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });

    it("should handle CSRF refresh failure", async () => {
      const csrfRefreshEndpoint = "/sanctum/csrf-cookie";
      let csrfInterceptor: any;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          if (error && !csrfInterceptor) csrfInterceptor = error;
        }
      );

      const refreshError = new Error("CSRF refresh failed");
      mockAxiosInstance.get.mockRejectedValueOnce(refreshError);

      createApiClient({
        baseURL: "https://api.example.com",
        csrfRefreshEndpoint,
        queries: {},
      });

      const error = {
        response: { status: 403 },
        config: { url: "/api/users", _retry: false },
      } as AxiosError;

      await expect(csrfInterceptor(error)).rejects.toEqual(refreshError);
    });
  });

  describe("Interceptors - Response Error", () => {
    it("should handle ERR_CANCELED error with nextTick", async () => {
      let errorInterceptor: any;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          errorInterceptor = { success, error };
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        queries: {},
      });

      const error = {
        code: "ERR_CANCELED",
        message: "Request canceled",
      } as AxiosError;

      await expect(errorInterceptor.error(error)).rejects.toEqual(error);
      expect(nextTick).toHaveBeenCalled();
    });

    it("should handle non-canceled errors", async () => {
      let errorInterceptor: any;

      mockAxiosInstance.interceptors.response.use.mockImplementation(
        (success: any, error: any) => {
          errorInterceptor = { success, error };
        }
      );

      createApiClient({
        baseURL: "https://api.example.com",
        queries: {},
      });

      const error = {
        code: "ERR_NETWORK",
        message: "Network Error",
      } as AxiosError;

      await expect(errorInterceptor.error(error)).rejects.toEqual(error);
    });
  });

  describe("Interceptors - XSRF Token", () => {
    beforeEach(() => {
      // Mock document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: '',
      });
    });

    it("should add X-XSRF-TOKEN header when withCredentials is true and cookie exists", () => {
      let xsrfInterceptor: any;
      let callCount = 0;

      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (interceptor: any) => {
          if (callCount === 1) {
            xsrfInterceptor = interceptor;
          }
          callCount++;
        }
      );

      // Set mock cookie
      document.cookie = 'XSRF-TOKEN=test%20token%20value';

      createApiClient({
        baseURL: "https://api.example.com",
        withCredentials: true,
        queries: {},
      });

      const config = {
        url: "/api/test",
        headers: {},
      };

      xsrfInterceptor(config);

      expect(config.headers['X-XSRF-TOKEN']).toBe('test token value');
    });

    it("should not add X-XSRF-TOKEN header when cookie does not exist", () => {
      let xsrfInterceptor: any;
      let callCount = 0;

      mockAxiosInstance.interceptors.request.use.mockImplementation(
        (interceptor: any) => {
          if (callCount === 1) {
            xsrfInterceptor = interceptor;
          }
          callCount++;
        }
      );

      // No XSRF-TOKEN cookie
      document.cookie = '';

      createApiClient({
        baseURL: "https://api.example.com",
        withCredentials: true,
        queries: {},
      });

      const config = {
        url: "/api/test",
        headers: {},
      };

      xsrfInterceptor(config);

      expect(config.headers['X-XSRF-TOKEN']).toBeUndefined();
    });

    it("should not add XSRF interceptor when withCredentials is false", () => {
      let interceptorCount = 0;

      mockAxiosInstance.interceptors.request.use.mockImplementation(() => {
        interceptorCount++;
      });

      createApiClient({
        baseURL: "https://api.example.com",
        withCredentials: false,
        queries: {},
      });

      // Only path param handler should be registered
      expect(interceptorCount).toBe(1);
    });
  });
});
