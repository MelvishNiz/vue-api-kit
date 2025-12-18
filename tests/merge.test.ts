import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  defineQuery,
  defineMutation,
  mergeQueries,
  mergeMutations,
} from "../src/core/merge";
import type { ApiQuery, ApiMutation } from "../src/core/types";

describe("defineQuery", () => {
  it("should return the query definition unchanged", () => {
    const query = defineQuery({
      method: "GET",
      path: "/users",
      response: z.array(z.object({ id: z.number(), name: z.string() })),
    });

    expect(query).toEqual({
      method: "GET",
      path: "/users",
      response: expect.any(Object),
    });
  });

  it("should support POST queries with data", () => {
    const query = defineQuery({
      method: "POST",
      path: "/users/search",
      data: z.object({ query: z.string() }),
      response: z.array(z.object({ id: z.number(), name: z.string() })),
    });

    expect(query.method).toBe("POST");
    expect(query.path).toBe("/users/search");
    expect(query.data).toBeDefined();
  });

  it("should support queries with params", () => {
    const query = defineQuery({
      path: "/users/{id}",
      params: z.object({ id: z.number() }),
      response: z.object({ id: z.number(), name: z.string() }),
    });

    expect(query.path).toBe("/users/{id}");
    expect(query.params).toBeDefined();
  });
});

describe("defineMutation", () => {
  it("should return the mutation definition unchanged", () => {
    const mutation = defineMutation({
      method: "POST",
      path: "/users",
      data: z.object({ name: z.string(), email: z.string().email() }),
      response: z.object({ id: z.number(), name: z.string() }),
    });

    expect(mutation).toEqual({
      method: "POST",
      path: "/users",
      data: expect.any(Object),
      response: expect.any(Object),
    });
  });

  it("should support all HTTP methods", () => {
    const postMutation = defineMutation({ method: "POST", path: "/users" });
    const putMutation = defineMutation({ method: "PUT", path: "/users/1" });
    const patchMutation = defineMutation({ method: "PATCH", path: "/users/1" });
    const deleteMutation = defineMutation({ method: "DELETE", path: "/users/1" });

    expect(postMutation.method).toBe("POST");
    expect(putMutation.method).toBe("PUT");
    expect(patchMutation.method).toBe("PATCH");
    expect(deleteMutation.method).toBe("DELETE");
  });

  it("should support multipart mutations", () => {
    const mutation = defineMutation({
      method: "POST",
      path: "/upload",
      isMultipart: true,
    });

    expect(mutation.isMultipart).toBe(true);
  });
});

describe("mergeQueries", () => {
  it("should merge multiple query objects", () => {
    const userQueries = {
      getUsers: defineQuery({
        path: "/users",
        response: z.array(z.object({ id: z.number() })),
      }),
    };

    const postQueries = {
      getPosts: defineQuery({
        path: "/posts",
        response: z.array(z.object({ id: z.number() })),
      }),
    };

    const merged = mergeQueries(userQueries, postQueries);

    expect(merged).toHaveProperty("getUsers");
    expect(merged).toHaveProperty("getPosts");
    expect(merged.getUsers.path).toBe("/users");
    expect(merged.getPosts.path).toBe("/posts");
  });

  it("should merge nested query objects", () => {
    const authQueries = {
      auth: {
        me: defineQuery({
          path: "/auth/me",
          response: z.object({ id: z.number() }),
        }),
        profile: defineQuery({
          path: "/auth/profile",
          response: z.object({ email: z.string() }),
        }),
      },
    };

    const userQueries = {
      users: {
        list: defineQuery({
          path: "/users",
          response: z.array(z.object({ id: z.number() })),
        }),
      },
    };

    const merged = mergeQueries(authQueries, userQueries);

    expect(merged).toHaveProperty("auth");
    expect(merged).toHaveProperty("users");
    expect(merged.auth.me.path).toBe("/auth/me");
    expect(merged.auth.profile.path).toBe("/auth/profile");
    expect(merged.users.list.path).toBe("/users");
  });

  it("should merge flat and nested query objects", () => {
    const flatQueries = {
      getStatus: defineQuery({
        path: "/status",
        response: z.object({ status: z.string() }),
      }),
    };

    const nestedQueries = {
      auth: {
        me: defineQuery({
          path: "/auth/me",
          response: z.object({ id: z.number() }),
        }),
      },
    };

    const merged = mergeQueries(flatQueries, nestedQueries);

    expect(merged).toHaveProperty("getStatus");
    expect(merged).toHaveProperty("auth");
    expect(merged.getStatus.path).toBe("/status");
    expect(merged.auth.me.path).toBe("/auth/me");
  });

  it("should merge nested objects with same parent key", () => {
    const queries1 = {
      auth: {
        me: defineQuery({ path: "/auth/me" }),
      },
    };

    const queries2 = {
      auth: {
        profile: defineQuery({ path: "/auth/profile" }),
      },
    };

    const merged = mergeQueries(queries1, queries2);

    expect(merged.auth.me.path).toBe("/auth/me");
    expect(merged.auth.profile.path).toBe("/auth/profile");
  });

  it("should merge multiple query objects with overlapping keys (last one wins)", () => {
    const queries1 = {
      getItem: defineQuery({ path: "/items/1" }),
    };

    const queries2 = {
      getItem: defineQuery({ path: "/items/2" }),
    };

    const merged = mergeQueries(queries1, queries2);

    expect(merged.getItem.path).toBe("/items/2");
  });

  it("should handle empty merge", () => {
    const merged = mergeQueries();

    expect(merged).toEqual({});
  });

  it("should merge three or more query objects", () => {
    const queries1 = {
      query1: defineQuery({ path: "/path1" }),
    };

    const queries2 = {
      query2: defineQuery({ path: "/path2" }),
    };

    const queries3 = {
      query3: defineQuery({ path: "/path3" }),
    };

    const merged = mergeQueries(queries1, queries2, queries3);

    expect(merged).toHaveProperty("query1");
    expect(merged).toHaveProperty("query2");
    expect(merged).toHaveProperty("query3");
  });
});

describe("mergeMutations", () => {
  it("should merge multiple mutation objects", () => {
    const userMutations = {
      createUser: defineMutation({
        method: "POST",
        path: "/users",
      }),
    };

    const postMutations = {
      createPost: defineMutation({
        method: "POST",
        path: "/posts",
      }),
    };

    const merged = mergeMutations(userMutations, postMutations);

    expect(merged).toHaveProperty("createUser");
    expect(merged).toHaveProperty("createPost");
    expect(merged.createUser.path).toBe("/users");
    expect(merged.createPost.path).toBe("/posts");
  });

  it("should merge nested mutation objects", () => {
    const authMutations = {
      auth: {
        login: defineMutation({
          method: "POST",
          path: "/auth/login",
        }),
        logout: defineMutation({
          method: "POST",
          path: "/auth/logout",
        }),
      },
    };

    const userMutations = {
      users: {
        create: defineMutation({
          method: "POST",
          path: "/users",
        }),
      },
    };

    const merged = mergeMutations(authMutations, userMutations);

    expect(merged).toHaveProperty("auth");
    expect(merged).toHaveProperty("users");
    expect(merged.auth.login.path).toBe("/auth/login");
    expect(merged.auth.logout.path).toBe("/auth/logout");
    expect(merged.users.create.path).toBe("/users");
  });

  it("should merge flat and nested mutation objects", () => {
    const flatMutations = {
      ping: defineMutation({
        method: "POST",
        path: "/ping",
      }),
    };

    const nestedMutations = {
      auth: {
        login: defineMutation({
          method: "POST",
          path: "/auth/login",
        }),
      },
    };

    const merged = mergeMutations(flatMutations, nestedMutations);

    expect(merged).toHaveProperty("ping");
    expect(merged).toHaveProperty("auth");
    expect(merged.ping.path).toBe("/ping");
    expect(merged.auth.login.path).toBe("/auth/login");
  });

  it("should merge nested objects with same parent key", () => {
    const mutations1 = {
      auth: {
        login: defineMutation({ method: "POST", path: "/auth/login" }),
      },
    };

    const mutations2 = {
      auth: {
        logout: defineMutation({ method: "POST", path: "/auth/logout" }),
      },
    };

    const merged = mergeMutations(mutations1, mutations2);

    expect(merged.auth.login.path).toBe("/auth/login");
    expect(merged.auth.logout.path).toBe("/auth/logout");
  });

  it("should merge multiple mutation objects with overlapping keys (last one wins)", () => {
    const mutations1 = {
      updateItem: defineMutation({ method: "PUT", path: "/items/1" }),
    };

    const mutations2 = {
      updateItem: defineMutation({ method: "PATCH", path: "/items/2" }),
    };

    const merged = mergeMutations(mutations1, mutations2);

    expect(merged.updateItem.method).toBe("PATCH");
    expect(merged.updateItem.path).toBe("/items/2");
  });

  it("should handle empty merge", () => {
    const merged = mergeMutations();

    expect(merged).toEqual({});
  });

  it("should merge three or more mutation objects", () => {
    const mutations1 = {
      mutation1: defineMutation({ method: "POST", path: "/path1" }),
    };

    const mutations2 = {
      mutation2: defineMutation({ method: "PUT", path: "/path2" }),
    };

    const mutations3 = {
      mutation3: defineMutation({ method: "DELETE", path: "/path3" }),
    };

    const merged = mergeMutations(mutations1, mutations2, mutations3);

    expect(merged).toHaveProperty("mutation1");
    expect(merged).toHaveProperty("mutation2");
    expect(merged).toHaveProperty("mutation3");
  });
});
