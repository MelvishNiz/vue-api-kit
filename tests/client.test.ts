import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
});
