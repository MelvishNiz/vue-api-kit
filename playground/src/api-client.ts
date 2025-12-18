import { createApiClient, z } from "../../dist";

export const useApi = createApiClient({
  baseURL: "https://jsonplaceholder.typicode.com",
  headers: {
    "access-control-allow-origin": "*",
  },
  withCredentials: true,
  onBeforeRequest: async (config) => {
    config.headers.Authorization = "Bearer demo-token";
  },
  onStartRequest: async () => {
    console.log("Request started");
  },
  onFinishRequest: async () => {
    console.log("Request finished");
  },
  onErrorRequest({message, status, code, data}) {
    console.log("message", message);
    console.log("status", status);
    console.log("code", code);
    console.log("data", data);
  },
  queries: {
    posts: {
      method: "GET",
      path: "/posts",
      response: z.array(z.object({
        userId: z.number(),
        id: z.number(),
        title: z.string(),
        body: z.string(),
      }))
    },
    post: {
      method: "GET",
      path: "/posts/{id}",
      params: z.object({
        id: z.number(),
      }),
      response: z.object({
        userId: z.number(),
        id: z.number(),
        title: z.string(),
        body: z.string(),
      }),
    },
    comments: {
      method: "GET",
      path: "/posts/{postId}/comments",
      params: z.object({
        postId: z.string().regex(/^\d+$/),
      }),
      response: z.array(z.object({
        postId: z.number(),
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        body: z.string(),
      })),
    },
    // Example POST query for searching
    searchPosts: {
      method: "POST",
      path: "/posts/1", // Using this endpoint as a demo since JSONPlaceholder doesn't have a search endpoint
      data: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        userId: z.number().optional(),
      }),
      response: z.object({
        userId: z.number(),
        id: z.number(),
        title: z.string(),
        body: z.string(),
      }),
    }
  },
  mutations: {
    createPost: {
      method: "POST",
      path: "/posts",
      data: z.object({
        title: z.string(),
        body: z.string(),
        userId: z.number(),
      }),
      response: z.object({
        id: z.number(),
        title: z.string(),
        body: z.string(),
        userId: z.number(),
      }),
    },
    updatePost: {
      method: "PUT",
      path: "/posts/{id}",
      params: z.object({
        id: z.number(),
      }),
      data: z.object({
        title: z.string(),
        body: z.string(),
        userId: z.number(),
      }),
      response: z.object({
        id: z.number(),
        title: z.string(),
        body: z.string(),
        userId: z.number(),
      }),
    },
    deletePost: {
      method: "DELETE",
      path: "/posts/{id}",
      params: z.object({
        id: z.number(),
      }),
      response: z.object({}),
    },
  }
});

export const useApiUpload = createApiClient({
  baseURL: "https://tmpfiles.org/api/v1",
  mutations: {
    uploadImage: {
      method: "POST",
      path: "/upload",
      isMultipart: true,  // Enable multipart/form-data
      data: z.object({
        file: z.instanceof(File),
      }),
      response: z.object({
        status: z.string(),
        data: z.object({
          url: z.string(),
        })
      }),
    },
  }
});

export const useApiSanctum = createApiClient({
  baseURL: "http://localhost",
  withCredentials: true,
  csrfRefreshEndpoint: "/sanctum/csrf-cookie",
  mutations: {
    authLogin: {
      method: "POST",
      path: "/api/auth/login",
      data: z.object({
        email: z.email(),
        password: z.string(),
        is_remember_me: z.boolean(),
      }),
      response: z.object({
        success: z.boolean(),
        data: z.object({
          session: z.object({
            token: z.string().nullable(),
            user: z.object({
              id: z.number(),
              name: z.string(),
              email: z.email(),
              type: z.enum(["superadmin", "user"]),
              is_active: z.boolean(),
              email_verified_at: z.union([z.string(), z.date(), z.undefined()]),
              created_at: z.union([z.string(), z.date(), z.undefined()]),
              updated_at: z.union([z.string(), z.date(), z.undefined()]),
            }),
          })
        }),
      }),
    }
  }
})
