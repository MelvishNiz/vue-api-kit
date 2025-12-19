import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";
import { createApiClient } from "../src/core/client";
import { defineQuery, defineMutation } from "../src/core/merge";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("Nested Structure Support", () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosInstance = {
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance);
  });

  describe("Nested Queries", () => {
    it("should support single-level nested queries", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          users: {
            getAll: defineQuery({
              method: "GET",
              path: "/users",
              response: z.array(z.object({ id: z.number(), name: z.string() })),
            }),
            getById: defineQuery({
              method: "GET",
              path: "/users/{id}",
              params: z.object({ id: z.number() }),
              response: z.object({ id: z.number(), name: z.string() }),
            }),
          },
        },
      });

      expect(api.query.users).toBeDefined();
      expect(api.query.users.getAll).toBeDefined();
      expect(api.query.users.getById).toBeDefined();
      expect(typeof api.query.users.getAll).toBe("function");
      expect(typeof api.query.users.getById).toBe("function");
    });

    it("should support multi-level nested queries", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          api: {
            v1: {
              users: {
                getAll: defineQuery({
                  path: "/api/v1/users",
                  response: z.array(z.object({ id: z.number() })),
                }),
                getById: defineQuery({
                  path: "/api/v1/users/{id}",
                  params: z.object({ id: z.number() }),
                  response: z.object({ id: z.number() }),
                }),
              },
              posts: {
                getAll: defineQuery({
                  path: "/api/v1/posts",
                  response: z.array(z.object({ id: z.number() })),
                }),
              },
            },
          },
        },
      });

      expect(api.query.api).toBeDefined();
      expect(api.query.api.v1).toBeDefined();
      expect(api.query.api.v1.users).toBeDefined();
      expect(api.query.api.v1.users.getAll).toBeDefined();
      expect(api.query.api.v1.users.getById).toBeDefined();
      expect(api.query.api.v1.posts).toBeDefined();
      expect(api.query.api.v1.posts.getAll).toBeDefined();
    });

    it("should execute nested query correctly", async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        data: [
          { id: 1, name: "John" },
          { id: 2, name: "Jane" },
        ],
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          users: {
            getAll: defineQuery({
              method: "GET",
              path: "/users",
              response: z.array(z.object({ id: z.number(), name: z.string() })),
            }),
          },
        },
      });

      const { result, isLoading, refetch } = api.query.users.getAll({ loadOnMount: false });

      expect(result.value).toBeUndefined();
      expect(isLoading.value).toBe(false);

      await refetch();

      expect(result.value).toEqual([
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ]);
    });

    it("should support mixed flat and nested queries", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          // Flat query
          getStatus: defineQuery({
            path: "/status",
            response: z.object({ status: z.string() }),
          }),
          // Nested queries
          users: {
            getAll: defineQuery({
              path: "/users",
              response: z.array(z.object({ id: z.number() })),
            }),
          },
        },
      });

      expect(api.query.getStatus).toBeDefined();
      expect(typeof api.query.getStatus).toBe("function");
      expect(api.query.users).toBeDefined();
      expect(typeof api.query.users.getAll).toBe("function");
    });
  });

  describe("Nested Mutations", () => {
    it("should support single-level nested mutations", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          users: {
            create: defineMutation({
              method: "POST",
              path: "/users",
              data: z.object({ name: z.string() }),
              response: z.object({ id: z.number(), name: z.string() }),
            }),
            update: defineMutation({
              method: "PUT",
              path: "/users/{id}",
              params: z.object({ id: z.number() }),
              data: z.object({ name: z.string() }),
              response: z.object({ id: z.number(), name: z.string() }),
            }),
          },
        },
      });

      expect(api.mutation.users).toBeDefined();
      expect(api.mutation.users.create).toBeDefined();
      expect(api.mutation.users.update).toBeDefined();
      expect(typeof api.mutation.users.create).toBe("function");
      expect(typeof api.mutation.users.update).toBe("function");
    });

    it("should support multi-level nested mutations", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          api: {
            v1: {
              users: {
                create: defineMutation({
                  method: "POST",
                  path: "/api/v1/users",
                  data: z.object({ name: z.string() }),
                }),
                delete: defineMutation({
                  method: "DELETE",
                  path: "/api/v1/users/{id}",
                  params: z.object({ id: z.number() }),
                }),
              },
            },
          },
        },
      });

      expect(api.mutation.api).toBeDefined();
      expect(api.mutation.api.v1).toBeDefined();
      expect(api.mutation.api.v1.users).toBeDefined();
      expect(api.mutation.api.v1.users.create).toBeDefined();
      expect(api.mutation.api.v1.users.delete).toBeDefined();
    });

    it("should execute nested mutation correctly", async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        data: {
          id: 1,
          name: "John",
        },
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          users: {
            create: defineMutation({
              method: "POST",
              path: "/users",
              data: z.object({ name: z.string() }),
              response: z.object({ id: z.number(), name: z.string() }),
            }),
          },
        },
      });

      const { mutate, result, isLoading } = api.mutation.users.create();

      expect(result.value).toBeUndefined();
      expect(isLoading.value).toBe(false);

      await mutate({ data: { name: "John" } });

      expect(result.value).toEqual({ id: 1, name: "John" });
    });

    it("should support mixed flat and nested mutations", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          // Flat mutation
          logout: defineMutation({
            method: "POST",
            path: "/logout",
          }),
          // Nested mutations
          users: {
            create: defineMutation({
              method: "POST",
              path: "/users",
              data: z.object({ name: z.string() }),
            }),
          },
        },
      });

      expect(api.mutation.logout).toBeDefined();
      expect(typeof api.mutation.logout).toBe("function");
      expect(api.mutation.users).toBeDefined();
      expect(typeof api.mutation.users.create).toBe("function");
    });
  });

  describe("Complex Nested Structures", () => {
    it("should support deeply nested structure with both queries and mutations", () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          admin: {
            users: {
              list: defineQuery({ path: "/admin/users" }),
              search: defineQuery({ path: "/admin/users/search", method: "POST" }),
            },
            reports: {
              daily: defineQuery({ path: "/admin/reports/daily" }),
              monthly: defineQuery({ path: "/admin/reports/monthly" }),
            },
          },
          public: {
            posts: {
              list: defineQuery({ path: "/posts" }),
            },
          },
        },
        mutations: {
          admin: {
            users: {
              create: defineMutation({ method: "POST", path: "/admin/users" }),
              update: defineMutation({ method: "PUT", path: "/admin/users/{id}" }),
              delete: defineMutation({ method: "DELETE", path: "/admin/users/{id}" }),
            },
          },
          public: {
            comments: {
              create: defineMutation({ method: "POST", path: "/comments" }),
            },
          },
        },
      });

      // Verify queries structure
      expect(api.query.admin.users.list).toBeDefined();
      expect(api.query.admin.users.search).toBeDefined();
      expect(api.query.admin.reports.daily).toBeDefined();
      expect(api.query.admin.reports.monthly).toBeDefined();
      expect(api.query.public.posts.list).toBeDefined();

      // Verify mutations structure
      expect(api.mutation.admin.users.create).toBeDefined();
      expect(api.mutation.admin.users.update).toBeDefined();
      expect(api.mutation.admin.users.delete).toBeDefined();
      expect(api.mutation.public.comments.create).toBeDefined();
    });

    it("should handle POST queries in nested structure", async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        data: [{ id: 1, name: "John" }],
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          users: {
            search: defineQuery({
              method: "POST",
              path: "/users/search",
              data: z.object({ query: z.string() }),
              response: z.array(z.object({ id: z.number(), name: z.string() })),
            }),
          },
        },
      });

      const { result, refetch } = api.query.users.search({
        loadOnMount: false,
        data: { query: "John" },
      });

      await refetch();

      expect(result.value).toEqual([{ id: 1, name: "John" }]);
    });

    it("should maintain type safety with nested structures", async () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          users: {
            getById: defineQuery({
              path: "/users/{id}",
              params: z.object({ id: z.number() }),
              response: z.object({ id: z.number(), name: z.string(), email: z.string() }),
            }),
          },
        },
      });

      // The TypeScript compiler should catch type errors at compile time
      // This is more of a demonstration that the structure supports proper typing
      const { result } = api.query.users.getById({
        loadOnMount: false,
        params: { id: 1 },
      });

      // Result should be typed properly
      expect(result.value).toBeUndefined();
    });
  });

  describe("Backward Compatibility", () => {
    it("should still support flat structure (backward compatible)", async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        data: [{ id: 1, name: "John" }],
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          getUsers: defineQuery({
            path: "/users",
            response: z.array(z.object({ id: z.number(), name: z.string() })),
          }),
        },
        mutations: {
          createUser: defineMutation({
            method: "POST",
            path: "/users",
            data: z.object({ name: z.string() }),
          }),
        },
      });

      // Old flat structure should still work
      expect(api.query.getUsers).toBeDefined();
      expect(typeof api.query.getUsers).toBe("function");
      expect(api.mutation.createUser).toBeDefined();
      expect(typeof api.mutation.createUser).toBe("function");

      const { result, refetch } = api.query.getUsers({ loadOnMount: false });
      await refetch();
      expect(result.value).toEqual([{ id: 1, name: "John" }]);
    });
  });

  describe("Error Handling in Nested Structure", () => {
    it("should handle errors correctly in nested queries", async () => {
      mockAxiosInstance.request.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
        message: "Internal Server Error",
      });

      const api = createApiClient({
        baseURL: "https://api.example.com",
        queries: {
          users: {
            getAll: defineQuery({
              path: "/users",
              response: z.array(z.object({ id: z.number() })),
            }),
          },
        },
      });

      const { errorMessage, refetch } = api.query.users.getAll({ loadOnMount: false });

      await refetch();

      expect(errorMessage.value).toBeDefined();
      expect(errorMessage.value).toContain("Internal Server Error");
    });

    it("should handle validation errors in nested mutations", async () => {
      const api = createApiClient({
        baseURL: "https://api.example.com",
        mutations: {
          users: {
            create: defineMutation({
              method: "POST",
              path: "/users",
              data: z.object({
                name: z.string().min(3),
                email: z.string().email(),
              }),
            }),
          },
        },
      });

      const { mutate, errorMessage } = api.mutation.users.create();

      // Try to mutate with invalid data
      await mutate({
        data: {
          name: "Jo", // Too short
          email: "invalid-email", // Invalid email
        },
      });

      expect(errorMessage.value).toBeDefined();
      expect(errorMessage.value).toContain("Validation error");
    });
  });
});
