import { z } from "zod";

// Variation schema
const productVariationSchema = z.object({
    size: z.string().optional(),    // e.g., L, XL, XXL
    color: z.string().optional(),   // e.g., Black, Red, Green
    stock: z.number().min(0),       // must be >= 0
    price: z.number().optional(),   // if not provided, use basePrice
});

// Create Product Validator
export const createProductZodSchema = z.object({
    name: z.string(),
    slug: z.string(), 
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    deleteImages: z.array(z.string()).optional(),
    basePrice: z.number(),
    category: z.string().optional(),
    variations: z.array(productVariationSchema).min(1, "At least one variation is required"),
});

// Update Product Validator
export const updateProductZodSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().optional(),
    category: z.string().optional(),
    variations: z.array(productVariationSchema).optional(),
    deleteImages: z.array(z.string()).optional(), // if you need image handling
});


