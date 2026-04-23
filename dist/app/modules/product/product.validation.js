"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductZodSchema = exports.createProductZodSchema = void 0;
const zod_1 = require("zod");
const productVariationSchema = zod_1.z.object({
    size: zod_1.z.string().optional(),
    color: zod_1.z.string().optional(),
    stock: zod_1.z.number().min(0),
    price: zod_1.z.number().optional(),
});
const specificationSchema = zod_1.z.object({
    name: zod_1.z.string(),
    value: zod_1.z.string(),
});
exports.createProductZodSchema = zod_1.z.object({
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    basePrice: zod_1.z.number(), // Back to normal!
    category: zod_1.z.string().optional(),
    video: zod_1.z.string().optional(), // New field for video URL
    isFeatured: zod_1.z.boolean().optional(),
    isMenu: zod_1.z.boolean().optional(),
    isTrendy: zod_1.z.boolean().optional(),
    bulletPoints: zod_1.z.array(zod_1.z.string()).optional(), // Back to normal!
    specifications: zod_1.z.array(specificationSchema).optional(), // Back to normal!
    variations: zod_1.z.array(productVariationSchema).min(1, "At least one variation is required"),
});
exports.updateProductZodSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    metaTitle: zod_1.z.string().optional(),
    metaDescription: zod_1.z.string().optional(),
    basePrice: zod_1.z.number().optional(),
    category: zod_1.z.string().optional(),
    video: zod_1.z.string().optional(),
    isFeatured: zod_1.z.boolean().optional(),
    deleteImages: zod_1.z.array(zod_1.z.string()).optional(),
    isMenu: zod_1.z.boolean().optional(),
    isTrendy: zod_1.z.boolean().optional(),
    bulletPoints: zod_1.z.array(zod_1.z.string()).optional(),
    specifications: zod_1.z.array(specificationSchema).optional(),
    variations: zod_1.z.array(productVariationSchema).min(1, "At least one variation is required").optional(),
});
