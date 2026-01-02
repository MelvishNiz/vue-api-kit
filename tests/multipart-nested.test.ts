import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApiClient } from "../src/index";
import { z } from "zod";
import axios from "axios";

describe("Multipart Nested Object Support", () => {
  let mockRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = vi.fn();
    vi.spyOn(axios, "create").mockReturnValue({
      request: mockRequest,
      interceptors: {
        request: {
          use: vi.fn((fn) => fn),
        },
        response: {
          use: vi.fn(),
        },
      },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should flatten nested objects with bracket notation in multipart", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true, url: "https://example.com/image.jpg" },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadWithNested: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({
            success: z.boolean(),
            url: z.string(),
          }),
        },
      },
    });

    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const { mutate } = api.mutation.uploadWithNested();

    await mutate({
      data: {
        code: "TEST001",
        name: "Test Product",
        description: "A test product",
        image: {
          file_url: "https://example.com/existing.jpg",
          file: file,
        },
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check that flat fields are appended correctly
    expect(formData.get("code")).toBe("TEST001");
    expect(formData.get("name")).toBe("Test Product");
    expect(formData.get("description")).toBe("A test product");

    // Check that nested object fields are flattened with bracket notation
    expect(formData.get("image[file_url]")).toBe("https://example.com/existing.jpg");
    expect(formData.get("image[file]")).toBe(file);
  });

  it("should handle deeply nested objects with bracket notation", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadDeepNested: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const { mutate } = api.mutation.uploadDeepNested();

    await mutate({
      data: {
        product: {
          details: {
            name: "Product Name",
            price: 100,
          },
          image: file,
        },
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check deeply nested fields
    expect(formData.get("product[details][name]")).toBe("Product Name");
    expect(formData.get("product[details][price]")).toBe("100");
    expect(formData.get("product[image]")).toBe(file);
  });

  it("should handle arrays within nested objects", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadWithArray: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
    const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });
    const { mutate } = api.mutation.uploadWithArray();

    await mutate({
      data: {
        images: {
          files: [file1, file2],
          alt_texts: ["Alt 1", "Alt 2"],
        },
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check that arrays in nested objects are handled correctly
    expect(formData.getAll("images[files]")).toEqual([file1, file2]);
    expect(formData.getAll("images[alt_texts]")).toEqual(["Alt 1", "Alt 2"]);
  });

  it("should handle mixed flat and nested structure", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadMixed: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const { mutate } = api.mutation.uploadMixed();

    await mutate({
      data: {
        "image[file]": file,  // Already flat with bracket notation
        code: "TEST001",
        image: {
          file_url: "https://example.com/existing.jpg",
        },
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check both notations work
    expect(formData.get("image[file]")).toBe(file);
    expect(formData.get("code")).toBe("TEST001");
    expect(formData.get("image[file_url]")).toBe("https://example.com/existing.jpg");
  });

  it("should handle null and undefined in nested objects", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadWithOptional: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const { mutate } = api.mutation.uploadWithOptional();

    await mutate({
      data: {
        product: {
          name: "Product Name",
          description: null,
          optional: undefined,
        },
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check that name is present
    expect(formData.get("product[name]")).toBe("Product Name");

    // null should be stringified
    expect(formData.get("product[description]")).toBe("null");

    // undefined should NOT be included in FormData
    expect(formData.get("product[optional]")).toBeNull();
  });

  it("should skip undefined file fields in multipart", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadWithUndefinedFile: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const { mutate } = api.mutation.uploadWithUndefinedFile();

    await mutate({
      data: {
        code: "TEST001",
        image: {
          file: undefined,
          url: "https://example.com/image.jpg",
        },
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check that code is present
    expect(formData.get("code")).toBe("TEST001");

    // Check that url is present
    expect(formData.get("image[url]")).toBe("https://example.com/image.jpg");

    // undefined file should NOT be included in FormData
    expect(formData.get("image[file]")).toBeNull();
  });
});
