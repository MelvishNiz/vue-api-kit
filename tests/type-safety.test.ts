import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createApiClient } from "../src/core/client";
import { defineQuery, defineMutation } from "../src/core/merge";

describe("Type Safety in Nested Structures", () => {
  it("should have fully typed nested query structure", () => {
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
        posts: {
          getAll: defineQuery({
            method: "GET",
            path: "/posts",
            response: z.array(z.object({ id: z.number(), title: z.string() })),
          }),
        },
      },
    });

    // TypeScript should infer these types correctly
    // api.query.users.getAll should be a function
    // api.query.users.getById should be a function
    // api.query.posts.getAll should be a function

    expect(typeof api.query.users.getAll).toBe("function");
    expect(typeof api.query.users.getById).toBe("function");
    expect(typeof api.query.posts.getAll).toBe("function");
  });

  it("should have fully typed nested mutation structure", () => {
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

    // TypeScript should infer these types correctly
    expect(typeof api.mutation.users.create).toBe("function");
    expect(typeof api.mutation.users.update).toBe("function");
  });

  it("should have fully typed deeply nested structure", () => {
    const api = createApiClient({
      baseURL: "https://api.example.com",
      queries: {
        api: {
          v1: {
            resources: {
              users: {
                list: defineQuery({
                  path: "/api/v1/users",
                  response: z.array(z.object({ id: z.number() })),
                }),
              },
            },
          },
        },
      },
    });

    // TypeScript should infer this deeply nested type correctly
    expect(typeof api.query.api.v1.resources.users.list).toBe("function");
  });
});
