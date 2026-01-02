import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { createApiClient } from "../src/core/client";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("createApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create an API client with queries", () => {
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
        getUsers: {
          path: "/users",
          response: z.array(z.object({ id: z.number(), name: z.string() })),
        },
      },
    });

    expect(api.query).toBeDefined();
    expect(api.query.getUsers).toBeDefined();
    expect(typeof api.query.getUsers).toBe("function");
  });

  it("should create an API client with mutations", () => {
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
        createUser: {
          method: "POST",
          path: "/users",
          data: z.object({ name: z.string() }),
          response: z.object({ id: z.number(), name: z.string() }),
        },
      },
    });

    expect(api.mutation).toBeDefined();
    expect(api.mutation.createUser).toBeDefined();
    expect(typeof api.mutation.createUser).toBe("function");
  });

  it("should create an API client with both queries and mutations", () => {
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
        getUsers: {
          path: "/users",
        },
      },
      mutations: {
        createUser: {
          method: "POST",
          path: "/users",
        },
      },
    });

    expect(api.query).toBeDefined();
    expect(api.mutation).toBeDefined();
    expect(api.query.getUsers).toBeDefined();
    expect(api.mutation.createUser).toBeDefined();
  });

  it("should configure axios with baseURL", () => {
    const mockCreate = vi.fn().mockReturnValue({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });
    vi.mocked(axios.create).mockImplementation(mockCreate);

    createApiClient({
      baseURL: "https://api.example.com",
      queries: {},
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://api.example.com",
      })
    );
  });

  it("should configure axios with custom headers", () => {
    const mockCreate = vi.fn().mockReturnValue({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });
    vi.mocked(axios.create).mockImplementation(mockCreate);

    createApiClient({
      baseURL: "https://api.example.com",
      headers: {
        Authorization: "Bearer token123",
      },
      queries: {},
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token123",
        }),
      })
    );
  });

  it("should configure axios with withCredentials option", () => {
    const mockCreate = vi.fn().mockReturnValue({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });
    vi.mocked(axios.create).mockImplementation(mockCreate);

    createApiClient({
      baseURL: "https://api.example.com",
      withCredentials: true,
      queries: {},
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        withCredentials: true,
      })
    );
  });

  it("should handle empty queries and mutations", () => {
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
    });

    expect(api.query).toBeDefined();
    expect(api.mutation).toBeDefined();
  });

  it("should register onBeforeRequest interceptor when provided", () => {
    const mockRequestInterceptor = { use: vi.fn() };
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: mockRequestInterceptor,
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const onBeforeRequest = vi.fn();
    createApiClient({
      baseURL: "https://api.example.com",
      onBeforeRequest,
      queries: {},
    });

    expect(mockRequestInterceptor.use).toHaveBeenCalled();
  });

  it("should register onStartRequest interceptor when provided", () => {
    const mockRequestInterceptor = { use: vi.fn() };
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: mockRequestInterceptor,
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const onStartRequest = vi.fn();
    createApiClient({
      baseURL: "https://api.example.com",
      onStartRequest,
      queries: {},
    });

    expect(mockRequestInterceptor.use).toHaveBeenCalled();
  });

  it("should register onFinishRequest interceptor when provided", () => {
    const mockResponseInterceptor = { use: vi.fn() };
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: mockResponseInterceptor,
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const onFinishRequest = vi.fn();
    createApiClient({
      baseURL: "https://api.example.com",
      onFinishRequest,
      queries: {},
    });

    expect(mockResponseInterceptor.use).toHaveBeenCalled();
  });

  it("should register CSRF refresh interceptor when csrfRefreshEndpoint is provided", () => {
    const mockResponseInterceptor = { use: vi.fn() };
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: mockResponseInterceptor,
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    createApiClient({
      baseURL: "https://api.example.com",
      csrfRefreshEndpoint: "/sanctum/csrf-cookie",
      queries: {},
    });

    expect(mockResponseInterceptor.use).toHaveBeenCalled();
  });

  it("should configure withCredentials as false by default", () => {
    const mockCreate = vi.fn().mockReturnValue({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    });
    vi.mocked(axios.create).mockImplementation(mockCreate);

    createApiClient({
      baseURL: "https://api.example.com",
      queries: {},
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        withCredentials: false,
      })
    );
  });

  it("should create API client with POST query method", () => {
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
        searchUsers: {
          method: "POST",
          path: "/users/search",
          data: z.object({ query: z.string() }),
          response: z.array(z.object({ id: z.number(), name: z.string() })),
        },
      },
    });

    expect(api.query).toBeDefined();
    expect(api.query.searchUsers).toBeDefined();
  });

  it("should create mutation with isMultipart flag", () => {
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
        uploadFile: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ url: z.string() }),
        },
      },
    });

    expect(api.mutation).toBeDefined();
    expect(api.mutation.uploadFile).toBeDefined();
  });

  it("should handle mutations with params schema", () => {
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
        updateUser: {
          method: "PUT",
          path: "/users/{id}",
          params: z.object({ id: z.number() }),
          data: z.object({ name: z.string() }),
        },
      },
    });

    expect(api.mutation).toBeDefined();
    expect(api.mutation.updateUser).toBeDefined();
  });

  it("should handle queries with params schema", () => {
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
        getUser: {
          path: "/users/{id}",
          params: z.object({ id: z.number() }),
          response: z.object({ id: z.number(), name: z.string() }),
        },
      },
    });

    expect(api.query).toBeDefined();
    expect(api.query.getUser).toBeDefined();
  });

  it("should handle query without response schema", () => {
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
        getUsers: {
          path: "/users",
        },
      },
    });

    expect(api.query).toBeDefined();
    expect(api.query.getUsers).toBeDefined();
  });

  it("should handle mutation without response schema", () => {
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
        deleteUser: {
          method: "DELETE",
          path: "/users/{id}",
        },
      },
    });

    expect(api.mutation).toBeDefined();
    expect(api.mutation.deleteUser).toBeDefined();
  });

  it("should register all global handlers when provided", () => {
    const mockRequestInterceptor = { use: vi.fn() };
    const mockResponseInterceptor = { use: vi.fn() };
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: mockRequestInterceptor,
          response: mockResponseInterceptor,
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const onBeforeRequest = vi.fn();
    const onStartRequest = vi.fn();
    const onFinishRequest = vi.fn();
    const onError = vi.fn();
    const onZodError = vi.fn();

    createApiClient({
      baseURL: "https://api.example.com",
      onBeforeRequest,
      onStartRequest,
      onFinishRequest,
      onError,
      onZodError,
      queries: {},
    });

    expect(mockRequestInterceptor.use).toHaveBeenCalled();
    expect(mockResponseInterceptor.use).toHaveBeenCalled();
  });

  it("should handle mutation with PATCH method", () => {
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
        patchUser: {
          method: "PATCH",
          path: "/users/{id}",
          params: z.object({ id: z.number() }),
          data: z.object({ name: z.string().optional() }),
        },
      },
    });

    expect(api.mutation).toBeDefined();
    expect(api.mutation.patchUser).toBeDefined();
  });

  it("should handle mutation with DELETE method", () => {
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
        deleteUser: {
          method: "DELETE",
          path: "/users/{id}",
          params: z.object({ id: z.number() }),
        },
      },
    });

    expect(api.mutation).toBeDefined();
    expect(api.mutation.deleteUser).toBeDefined();
  });

  it("should create client with complex nested schemas", () => {
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    const userSchema = z.object({
      id: z.number(),
      name: z.string(),
      profile: z.object({
        avatar: z.string().url(),
        bio: z.string().optional(),
      }),
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      queries: {
        getUser: {
          path: "/users/{id}",
          params: z.object({ id: z.number() }),
          response: userSchema,
        },
      },
      mutations: {
        updateProfile: {
          method: "PUT",
          path: "/users/{id}/profile",
          params: z.object({ id: z.number() }),
          data: z.object({
            avatar: z.string().url(),
            bio: z.string(),
          }),
          response: userSchema,
        },
      },
    });

    expect(api.query.getUser).toBeDefined();
    expect(api.mutation.updateProfile).toBeDefined();
  });

  it("should register path param handler interceptor", () => {
    const mockRequestInterceptor = { use: vi.fn() };
    const mockAxios = {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: mockRequestInterceptor,
          response: { use: vi.fn() },
        },
      }),
    };
    vi.mocked(axios.create).mockReturnValue(mockAxios.create());

    createApiClient({
      baseURL: "https://api.example.com",
      queries: {
        getUser: {
          path: "/users/{id}",
        },
      },
    });

    // Path param handler is always registered
    expect(mockRequestInterceptor.use).toHaveBeenCalled();
  });

  it("should handle queries with both params and data (POST query)", () => {
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
        searchUsersByCategory: {
          method: "POST",
          path: "/categories/{categoryId}/users/search",
          params: z.object({ categoryId: z.number() }),
          data: z.object({ query: z.string() }),
          response: z.array(z.object({ id: z.number(), name: z.string() })),
        },
      },
    });

    expect(api.query).toBeDefined();
    expect(api.query.searchUsersByCategory).toBeDefined();
  });

  it("should handle mutation without data schema", () => {
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
        triggerAction: {
          method: "POST",
          path: "/actions/trigger",
        },
      },
    });

    expect(api.mutation).toBeDefined();
    expect(api.mutation.triggerAction).toBeDefined();
  });
});

