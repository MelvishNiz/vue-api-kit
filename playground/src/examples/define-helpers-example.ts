/**
 * Example: Using defineQuery and defineMutation helpers
 * This demonstrates the new simplified API for defining queries and mutations
 */

import { z, defineQuery, defineMutation } from '../../../dist';

// Schemas
const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
});

const ProductListSchema = z.array(ProductSchema);

// ============================================================================
// BEFORE: Using 'as const' (old approach)
// ============================================================================

const oldStyleQueries = {
  getProducts: {
    method: 'GET' as const,
    path: '/products',
    response: ProductListSchema,
  },
  getProduct: {
    method: 'GET' as const,
    path: '/products/{id}',
    params: z.object({ id: z.number() }),
    response: ProductSchema,
  },
};

const oldStyleMutations = {
  createProduct: {
    method: 'POST' as const,
    path: '/products',
    data: z.object({
      name: z.string(),
      price: z.number(),
      category: z.string(),
    }),
    response: ProductSchema,
  },
};

// ============================================================================
// AFTER: Using defineQuery and defineMutation (new approach)
// ============================================================================

export const productQueries = {
  getProducts: defineQuery({
    method: 'GET',
    path: '/products',
    response: ProductListSchema,
  }),
  
  getProduct: defineQuery({
    method: 'GET',
    path: '/products/{id}',
    params: z.object({ id: z.number() }),
    response: ProductSchema,
  }),
  
  searchProducts: defineQuery({
    method: 'POST',
    path: '/products/search',
    data: z.object({
      query: z.string(),
      category: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
    }),
    response: ProductListSchema,
  }),
};

export const productMutations = {
  createProduct: defineMutation({
    method: 'POST',
    path: '/products',
    data: z.object({
      name: z.string(),
      price: z.number(),
      category: z.string(),
    }),
    response: ProductSchema,
  }),
  
  updateProduct: defineMutation({
    method: 'PUT',
    path: '/products/{id}',
    params: z.object({ id: z.number() }),
    data: z.object({
      name: z.string().optional(),
      price: z.number().optional(),
      category: z.string().optional(),
    }),
    response: ProductSchema,
  }),
  
  deleteProduct: defineMutation({
    method: 'DELETE',
    path: '/products/{id}',
    params: z.object({ id: z.number() }),
    response: z.object({ success: z.boolean() }),
  }),
};

// ============================================================================
// BENEFITS OF NEW APPROACH
// ============================================================================

/**
 * 1. ✅ Cleaner syntax - no more 'as const' needed
 * 2. ✅ Full type inference maintained
 * 3. ✅ More readable and consistent
 * 4. ✅ Zero runtime overhead (identity functions)
 * 5. ✅ Better developer experience
 * 
 * Both approaches provide the same type safety, but the new approach
 * is cleaner and more maintainable.
 */

export type Product = z.infer<typeof ProductSchema>;
