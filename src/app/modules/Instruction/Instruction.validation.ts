import { z } from "zod";

export const createInstructionSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1).optional(),
    thumbnail: z.string().optional(),
    pdfFile: z.string().optional()
});

export const updateInstructionSchema = z.object({
name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    thumbnail: z.string().optional(),
    pdfFile: z.string().optional()
});
