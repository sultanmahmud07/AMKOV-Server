import { model, Schema } from "mongoose";
import { IInstruction } from "./Instruction.interface";

const InstructionSchema = new Schema<IInstruction>({
    name: { type: String, required: true },
    slug: { type: String },
    thumbnail: { type: String }, // Optional image
    pdfFile: { type: String, required: true } // Stores the S3 URL of the PDF
}, {
    timestamps: true
});

export const Instruction = model<IInstruction>("Instruction", InstructionSchema);