"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInstructionSchema = exports.createInstructionSchema = void 0;
const zod_1 = require("zod");
exports.createInstructionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().min(1).optional(),
    thumbnail: zod_1.z.string().optional(),
    pdfFile: zod_1.z.string().optional()
});
exports.updateInstructionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    slug: zod_1.z.string().min(1).optional(),
    thumbnail: zod_1.z.string().optional(),
    pdfFile: zod_1.z.string().optional()
});
