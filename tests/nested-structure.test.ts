import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { createApiClient } from "../src/core/client";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("Nested API Structure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should support nested query definitions", () => {
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const api = createApiClient({
      baseURL: "https://api.example.com",
      queries: {
        auth: {
          me: {
            path: "/auth/me",
            response: z.object({ id: z.number(), name: z.string() }),
          },
          profile: {
            path: "/auth/profile",
            response: z.object({ id: z.number(), email: z.string() }),
          },
        },
        users: {
          list: {
            path: "/users",
            response: z.array(z.object({ id: z.number() })),
          },
        },
      },
    });

    // Check that nested structure is created
    expect(api.query).toBeDefined();
    expect(api.query.auth).toBeDefined();
    expect(api.query.auth.me).toBeDefined();
    expect(api.query.auth.profile).toBeDefined();
    expect(api.query.users).toBeDefined();
    expect(api.query.users.list).toBeDefined();
    
    // Check that hooks are functions
    expect(typeof api.query.auth.me).toBe("function");
    expect(typeof api.query.auth.profile).toBe("function");
    expect(typeof api.query.users.list).toBe("function");
  });

  it("should support nested mutation definitions", () => {
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        auth: {
          login: {
            method: "POST",
            path: "/auth/login",
            data: z.object({ email: z.string(), password: z.string() }),
            response: z.object({ token: z.string() }),
          },
          logout: {
            method: "POST",
            path: "/auth/logout",
          },
        },
        users: {
          create: {
            method: "POST",
            path: "/users",
            data: z.object({ name: z.string() }),
          },
        },
      },
    });

    // Check that nested structure is created
    expect(api.mutation).toBeDefined();
    expect(api.mutation.auth).toBeDefined();
    expect(api.mutation.auth.login).toBeDefined();
    expect(api.mutation.auth.logout).toBeDefined();
    expect(api.mutation.users).toBeDefined();
    expect(api.mutation.users.create).toBeDefined();
    
    // Check that hooks are functions
    expect(typeof api.mutation.auth.login).toBe("function");
    expect(typeof api.mutation.auth.logout).toBe("function");
    expect(typeof api.mutation.users.create).toBe("function");
  });

  it("should support deeply nested structures (3+ levels)", () => {
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const api = createApiClient({
      baseURL: "https://api.example.com",
      queries: {
        admin: {
          users: {
            permissions: {
              list: {
                path: "/admin/users/permissions",
                response: z.array(z.string()),
              },
            },
          },
        },
      },
      mutations: {
        admin: {
          users: {
            permissions: {
              grant: {
                method: "POST",
                path: "/admin/users/permissions/grant",
                data: z.object({ userId: z.number(), permission: z.string() }),
              },
            },
          },
        },
      },
    });

    // Check deeply nested query structure
    expect(api.query.admin).toBeDefined();
    expect(api.query.admin.users).toBeDefined();
    expect(api.query.admin.users.permissions).toBeDefined();
    expect(api.query.admin.users.permissions.list).toBeDefined();
    expect(typeof api.query.admin.users.permissions.list).toBe("function");

    // Check deeply nested mutation structure
    expect(api.mutation.admin).toBeDefined();
    expect(api.mutation.admin.users).toBeDefined();
    expect(api.mutation.admin.users.permissions).toBeDefined();
    expect(api.mutation.admin.users.permissions.grant).toBeDefined();
    expect(typeof api.mutation.admin.users.permissions.grant).toBe("function");
  });

  it("should support mixed flat and nested structures", () => {
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const api = createApiClient({
      baseURL: "https://api.example.com",
      queries: {
        // Flat structure
        getStatus: {
          path: "/status",
          response: z.object({ status: z.string() }),
        },
        // Nested structure
        auth: {
          me: {
            path: "/auth/me",
            response: z.object({ id: z.number() }),
          },
        },
      },
      mutations: {
        // Flat structure
        ping: {
          method: "POST",
          path: "/ping",
        },
        // Nested structure
        auth: {
          login: {
            method: "POST",
            path: "/auth/login",
          },
        },
      },
    });

    // Check flat structure
    expect(api.query.getStatus).toBeDefined();
    expect(typeof api.query.getStatus).toBe("function");
    expect(api.mutation.ping).toBeDefined();
    expect(typeof api.mutation.ping).toBe("function");

    // Check nested structure
    expect(api.query.auth.me).toBeDefined();
    expect(typeof api.query.auth.me).toBe("function");
    expect(api.mutation.auth.login).toBeDefined();
    expect(typeof api.mutation.auth.login).toBe("function");
  });

  it("should maintain backward compatibility with flat structure", () => {
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    // Old flat structure should still work
    const api = createApiClient({
      baseURL: "https://api.example.com",
      queries: {
        getUsers: {
          path: "/users",
          response: z.array(z.object({ id: z.number() })),
        },
        getUser: {
          path: "/users/{id}",
          params: z.object({ id: z.number() }),
          response: z.object({ id: z.number(), name: z.string() }),
        },
      },
      mutations: {
        createUser: {
          method: "POST",
          path: "/users",
          data: z.object({ name: z.string() }),
        },
      },
    });

    // Check that flat structure works as before
    expect(api.query.getUsers).toBeDefined();
    expect(typeof api.query.getUsers).toBe("function");
    expect(api.query.getUser).toBeDefined();
    expect(typeof api.query.getUser).toBe("function");
    expect(api.mutation.createUser).toBeDefined();
    expect(typeof api.mutation.createUser).toBe("function");
  });
});
