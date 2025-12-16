import { describe, it, expect } from "vitest";
import { z } from "zod";
import type { ApiQuery, ApiMutation, HTTPMethod, Infer } from "../src/core/types";

describe("Types", () => {
  describe("HTTPMethod", () => {
    it("should accept valid HTTP methods", () => {
      const methods: HTTPMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
      expect(methods).toHaveLength(5);
    });
  });

  describe("Infer", () => {
    it("should infer type from Zod schema", () => {
      const userSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
      });

      type User = Infer<typeof userSchema>;

      const user: User = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
      };

      expect(user.id).toBe(1);
      expect(user.name).toBe("John Doe");
      expect(user.email).toBe("john@example.com");
    });
  });

  describe("ApiQuery", () => {
    it("should define a GET query", () => {
      const query: ApiQuery = {
        method: "GET",
        path: "/users",
        response: z.array(z.object({ id: z.number() })),
      };

      expect(query.method).toBe("GET");
      expect(query.path).toBe("/users");
    });

    it("should define a POST query with data", () => {
      const query: ApiQuery = {
        method: "POST",
        path: "/users/search",
        data: z.object({ query: z.string() }),
        response: z.array(z.object({ id: z.number() })),
      };

      expect(query.method).toBe("POST");
      expect(query.path).toBe("/users/search");
      expect(query.data).toBeDefined();
    });

    it("should define a query with params", () => {
      const query: ApiQuery = {
        path: "/users/{id}",
        params: z.object({ id: z.number() }),
        response: z.object({ id: z.number(), name: z.string() }),
      };

      expect(query.path).toBe("/users/{id}");
      expect(query.params).toBeDefined();
    });

    it("should allow optional method (defaults to GET)", () => {
      const query: ApiQuery = {
        path: "/users",
      };

      expect(query.method).toBeUndefined();
      expect(query.path).toBe("/users");
    });
  });

  describe("ApiMutation", () => {
    it("should define a POST mutation", () => {
      const mutation: ApiMutation = {
        method: "POST",
        path: "/users",
        data: z.object({ name: z.string() }),
        response: z.object({ id: z.number(), name: z.string() }),
      };

      expect(mutation.method).toBe("POST");
      expect(mutation.path).toBe("/users");
    });

    it("should define a PUT mutation", () => {
      const mutation: ApiMutation = {
        method: "PUT",
        path: "/users/{id}",
        params: z.object({ id: z.number() }),
        data: z.object({ name: z.string() }),
      };

      expect(mutation.method).toBe("PUT");
      expect(mutation.path).toBe("/users/{id}");
    });

    it("should define a DELETE mutation", () => {
      const mutation: ApiMutation = {
        method: "DELETE",
        path: "/users/{id}",
        params: z.object({ id: z.number() }),
      };

      expect(mutation.method).toBe("DELETE");
      expect(mutation.path).toBe("/users/{id}");
    });

    it("should support multipart mutations", () => {
      const mutation: ApiMutation = {
        method: "POST",
        path: "/upload",
        isMultipart: true,
      };

      expect(mutation.isMultipart).toBe(true);
    });

    it("should define a PATCH mutation", () => {
      const mutation: ApiMutation = {
        method: "PATCH",
        path: "/users/{id}",
        params: z.object({ id: z.number() }),
        data: z.object({ name: z.string() }),
      };

      expect(mutation.method).toBe("PATCH");
    });
  });
});
