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
    expect(formData.get("images[files][0]")).toBe(file1);
    expect(formData.get("images[files][1]")).toBe(file2);
    // Primitive values in arrays now have indices
    expect(formData.get("images[alt_texts][0]")).toBe("Alt 1");
    expect(formData.get("images[alt_texts][1]")).toBe("Alt 2");
  });

  it("should preserve date values and serialize booleans consistently", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadTypedFields: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const publishedAt = new Date("2025-02-14T10:30:00.000Z");
    const { mutate } = api.mutation.uploadTypedFields();

    await mutate({
      data: {
        metadata: {
          is_active: true,
          published_at: publishedAt,
        },
        flags: [true, false],
        schedule: [publishedAt],
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    expect(formData.get("metadata[is_active]")).toBe("true");
    expect(formData.get("metadata[published_at]")).toBe(publishedAt.toISOString());
    expect(formData.get("flags[0]")).toBe("true");
    expect(formData.get("flags[1]")).toBe("false");
    expect(formData.get("schedule[0]")).toBe(publishedAt.toISOString());
  });

  it("should serialize booleans as 0/1 for Laravel multipart when configured", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadTypedFieldsLaravel: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          multipartBooleanStyle: "numeric",
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const { mutate } = api.mutation.uploadTypedFieldsLaravel();

    await mutate({
      data: {
        metadata: {
          is_active: true,
          is_draft: false,
        },
        flags: [true, false],
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    expect(formData.get("metadata[is_active]")).toBe("1");
    expect(formData.get("metadata[is_draft]")).toBe("0");
    expect(formData.get("flags[0]")).toBe("1");
    expect(formData.get("flags[1]")).toBe("0");
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

  it("should handle arrays of objects with proper indexing", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        uploadWithArrayOfObjects: {
          method: "POST",
          path: "/upload",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const { mutate } = api.mutation.uploadWithArrayOfObjects();

    await mutate({
      data: {
        members_form: {
          members: [
            {
              user: {
                country_code: "US",
                phone: "1234567890",
              },
              role: "admin",
            },
            {
              user: {
                country_code: "ID",
                phone: "9876543210",
              },
              role: "member",
            },
          ],
        },
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check that array indices are included for objects in arrays
    expect(formData.get("members_form[members][0][user][country_code]")).toBe("US");
    expect(formData.get("members_form[members][0][user][phone]")).toBe("1234567890");
    expect(formData.get("members_form[members][0][role]")).toBe("admin");
    expect(formData.get("members_form[members][1][user][country_code]")).toBe("ID");
    expect(formData.get("members_form[members][1][user][phone]")).toBe("9876543210");
    expect(formData.get("members_form[members][1][role]")).toBe("member");
  });

  it("should handle arrays of objects with various field names", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        submitFormWithArrays: {
          method: "POST",
          path: "/submit",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const { mutate } = api.mutation.submitFormWithArrays();

    await mutate({
      data: {
        products: [
          { name: "Product A", price: 100 },
          { name: "Product B", price: 200 },
        ],
        categories: [
          { id: 1, title: "Category 1" },
          { id: 2, title: "Category 2" },
        ],
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check products array
    expect(formData.get("products[0][name]")).toBe("Product A");
    expect(formData.get("products[0][price]")).toBe("100");
    expect(formData.get("products[1][name]")).toBe("Product B");
    expect(formData.get("products[1][price]")).toBe("200");

    // Check categories array
    expect(formData.get("categories[0][id]")).toBe("1");
    expect(formData.get("categories[0][title]")).toBe("Category 1");
    expect(formData.get("categories[1][id]")).toBe("2");
    expect(formData.get("categories[1][title]")).toBe("Category 2");
  });

  it("should handle nested arrays of primitives with indices", async () => {
    mockRequest.mockResolvedValue({
      data: { success: true },
    });

    const api = createApiClient({
      baseURL: "https://api.example.com",
      mutations: {
        submitNestedArrays: {
          method: "POST",
          path: "/submit",
          isMultipart: true,
          response: z.object({ success: z.boolean() }),
        },
      },
    });

    const { mutate } = api.mutation.submitNestedArrays();

    await mutate({
      data: {
        test: [
          {
            nested: {
              value: 'test',
              member: [
                "123123",
                "asdasd",
                "ggawdawd"
              ]
            }
          },
          {
            nested: {
              value: 'test2'
            }
          }
        ]
      },
    });

    expect(mockRequest).toHaveBeenCalled();
    const formData = mockRequest.mock.calls[0][0].data;
    expect(formData).toBeInstanceOf(FormData);

    // Check that nested arrays of primitives have indices
    expect(formData.get("test[0][nested][value]")).toBe("test");
    expect(formData.get("test[0][nested][member][0]")).toBe("123123");
    expect(formData.get("test[0][nested][member][1]")).toBe("asdasd");
    expect(formData.get("test[0][nested][member][2]")).toBe("ggawdawd");
    expect(formData.get("test[1][nested][value]")).toBe("test2");
  });
});
