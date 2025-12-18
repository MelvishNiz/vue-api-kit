import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { z } from "zod";
import { createApiClient } from "../src/core/client";
import axios from "axios";
import { nextTick } from "vue";

vi.mock("axios");
vi.mock("vue", async () => {
  const actual = await vi.importActual("vue");
  return {
    ...actual,
    nextTick: vi.fn((cb) => Promise.resolve().then(cb)),
  };
});

describe("Per-Query and Per-Mutation onBeforeRequest", () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = {
      request: vi.fn().mockResolvedValue({
        data: { id: 1, name: "Test User" },
      }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Query-level onBeforeRequest", () => {
    it("should call query-level onBeforeRequest hook defined in query definition", async () => {
      const queryOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Query-Header": "from-definition" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          getUser: {
            path: "/users/{id}",
            params: z.object({ id: z.number() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: queryOnBeforeRequest,
          },
        },
      });

      const { refetch } = api.query.getUser({ params: { id: 1 }, loadOnMount: false });
      await refetch();

      expect(queryOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Query-Header": "from-definition" }),
        })
      );
    });

    it("should call query-level onBeforeRequest hook from options", async () => {
      const optionsOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Options-Header": "from-options" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          getUser: {
            path: "/users/{id}",
            params: z.object({ id: z.number() }),
            response: z.object({ id: z.number(), name: z.string() }),
          },
        },
      });

      const { refetch } = api.query.getUser({
        params: { id: 1 },
        loadOnMount: false,
        onBeforeRequest: optionsOnBeforeRequest,
      });
      await refetch();

      expect(optionsOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Options-Header": "from-options" }),
        })
      );
    });

    it("should call both query definition and options onBeforeRequest hooks", async () => {
      const definitionOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Definition": "first" };
        return config;
      });

      const optionsOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Options": "second" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          getUser: {
            path: "/users/{id}",
            params: z.object({ id: z.number() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: definitionOnBeforeRequest,
          },
        },
      });

      const { refetch } = api.query.getUser({
        params: { id: 1 },
        loadOnMount: false,
        onBeforeRequest: optionsOnBeforeRequest,
      });
      await refetch();

      expect(definitionOnBeforeRequest).toHaveBeenCalled();
      expect(optionsOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Definition": "first",
            "X-Options": "second",
          }),
        })
      );
    });

    it("should work with POST queries", async () => {
      const queryOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Search-Header": "search" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          searchUsers: {
            method: "POST",
            path: "/users/search",
            data: z.object({ query: z.string() }),
            response: z.array(z.object({ id: z.number(), name: z.string() })),
            onBeforeRequest: queryOnBeforeRequest,
          },
        },
      });

      const { refetch } = api.query.searchUsers({
        data: { query: "test" },
        loadOnMount: false,
      });
      await refetch();

      expect(queryOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Search-Header": "search" }),
          data: { query: "test" },
        })
      );
    });

    it("should support async onBeforeRequest hook", async () => {
      const queryOnBeforeRequest = vi.fn(async (config) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        config.headers = { ...config.headers, "X-Async": "async-value" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          getUser: {
            path: "/users/{id}",
            params: z.object({ id: z.number() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: queryOnBeforeRequest,
          },
        },
      });

      const { refetch } = api.query.getUser({ params: { id: 1 }, loadOnMount: false });
      await refetch();

      expect(queryOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Async": "async-value" }),
        })
      );
    });
  });

  describe("Mutation-level onBeforeRequest", () => {
    it("should call mutation-level onBeforeRequest hook defined in mutation definition", async () => {
      const mutationOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Mutation-Header": "from-definition" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          createUser: {
            method: "POST",
            path: "/users",
            data: z.object({ name: z.string() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: mutationOnBeforeRequest,
          },
        },
      });

      const { mutate } = api.mutation.createUser();
      await mutate({ data: { name: "John" } });

      expect(mutationOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Mutation-Header": "from-definition" }),
        })
      );
    });

    it("should call mutation-level onBeforeRequest hook from options", async () => {
      const optionsOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Options-Header": "from-options" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          createUser: {
            method: "POST",
            path: "/users",
            data: z.object({ name: z.string() }),
            response: z.object({ id: z.number(), name: z.string() }),
          },
        },
      });

      const { mutate } = api.mutation.createUser({
        onBeforeRequest: optionsOnBeforeRequest,
      });
      await mutate({ data: { name: "John" } });

      expect(optionsOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Options-Header": "from-options" }),
        })
      );
    });

    it("should call both mutation definition and options onBeforeRequest hooks", async () => {
      const definitionOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Definition": "first" };
        return config;
      });

      const optionsOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Options": "second" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          createUser: {
            method: "POST",
            path: "/users",
            data: z.object({ name: z.string() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: definitionOnBeforeRequest,
          },
        },
      });

      const { mutate } = api.mutation.createUser({
        onBeforeRequest: optionsOnBeforeRequest,
      });
      await mutate({ data: { name: "John" } });

      expect(definitionOnBeforeRequest).toHaveBeenCalled();
      expect(optionsOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Definition": "first",
            "X-Options": "second",
          }),
        })
      );
    });

    it("should work with PUT mutations", async () => {
      const mutationOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Update-Header": "update" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          updateUser: {
            method: "PUT",
            path: "/users/{id}",
            params: z.object({ id: z.number() }),
            data: z.object({ name: z.string() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: mutationOnBeforeRequest,
          },
        },
      });

      const { mutate } = api.mutation.updateUser();
      await mutate({ data: { name: "Jane" }, params: { id: 1 } });

      expect(mutationOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Update-Header": "update" }),
        })
      );
    });

    it("should work with DELETE mutations", async () => {
      const mutationOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Delete-Header": "delete" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          deleteUser: {
            method: "DELETE",
            path: "/users/{id}",
            params: z.object({ id: z.number() }),
            onBeforeRequest: mutationOnBeforeRequest,
          },
        },
      });

      const { mutate } = api.mutation.deleteUser();
      await mutate({ params: { id: 1 } });

      expect(mutationOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Delete-Header": "delete" }),
        })
      );
    });

    it("should support async onBeforeRequest hook", async () => {
      const mutationOnBeforeRequest = vi.fn(async (config) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        config.headers = { ...config.headers, "X-Async": "async-value" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          createUser: {
            method: "POST",
            path: "/users",
            data: z.object({ name: z.string() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: mutationOnBeforeRequest,
          },
        },
      });

      const { mutate } = api.mutation.createUser();
      await mutate({ data: { name: "John" } });

      expect(mutationOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Async": "async-value" }),
        })
      );
    });

    it("should work with multipart mutations", async () => {
      const mutationOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Upload-Header": "upload" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          uploadFile: {
            method: "POST",
            path: "/upload",
            isMultipart: true,
            response: z.object({ url: z.string() }),
            onBeforeRequest: mutationOnBeforeRequest,
          },
        },
      });

      mockAxiosInstance.request.mockResolvedValue({
        data: { url: "https://example.com/file.jpg" },
      });

      const { mutate } = api.mutation.uploadFile();
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      await mutate({ data: { file } });

      expect(mutationOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Upload-Header": "upload" }),
        })
      );
    });
  });

  describe("Integration with global onBeforeRequest", () => {
    it("should call query-level onBeforeRequest hooks (global is handled by axios interceptors)", async () => {
      const queryOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Query": "query" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        onBeforeRequest: vi.fn((config) => {
          config.headers = { ...config.headers, "X-Global": "global" };
          return config;
        }),
        queries: {
          getUser: {
            path: "/users/{id}",
            params: z.object({ id: z.number() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: queryOnBeforeRequest,
          },
        },
      });

      const { refetch } = api.query.getUser({ params: { id: 1 }, loadOnMount: false });
      await refetch();

      // The query-level hook should be called
      expect(queryOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Query": "query" }),
        })
      );
    });

    it("should call mutation-level onBeforeRequest hooks (global is handled by axios interceptors)", async () => {
      const mutationOnBeforeRequest = vi.fn((config) => {
        config.headers = { ...config.headers, "X-Mutation": "mutation" };
        return config;
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        onBeforeRequest: vi.fn((config) => {
          config.headers = { ...config.headers, "X-Global": "global" };
          return config;
        }),
        mutations: {
          createUser: {
            method: "POST",
            path: "/users",
            data: z.object({ name: z.string() }),
            response: z.object({ id: z.number(), name: z.string() }),
            onBeforeRequest: mutationOnBeforeRequest,
          },
        },
      });

      const { mutate } = api.mutation.createUser();
      await mutate({ data: { name: "John" } });

      // The mutation-level hook should be called
      expect(mutationOnBeforeRequest).toHaveBeenCalled();
      expect(mockAxiosInstance.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ "X-Mutation": "mutation" }),
        })
      );
    });
  });
});
