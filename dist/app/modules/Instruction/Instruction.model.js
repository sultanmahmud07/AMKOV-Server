"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instruction = void 0;
const mongoose_1 = require("mongoose");
const InstructionSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    slug: { type: String },
    thumbnail: { type: String }, // Optional image
    pdfFile: { type: String, required: true } // Stores the S3 URL of the PDF
}, {
    timestamps: true
});
exports.Instruction = (0, mongoose_1.model)("Instruction", InstructionSchema);
