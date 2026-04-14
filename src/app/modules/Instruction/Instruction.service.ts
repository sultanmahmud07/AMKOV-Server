/* eslint-disable no-console */
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { InstructionSearchableFields } from "./Instruction.constant";
import { IInstruction } from "./Instruction.interface";
import { Instruction } from "./Instruction.model";

const createInstruction = async (payload: IInstruction) => {
    // const existingInstruction = await Instruction.findOne({ name: payload.slug });
    // if (existingInstruction) {
    //     throw new Error("An instruction with this slug already exists.");
    // }

    const instruction = await Instruction.create(payload);

    return instruction
};

const getAllInstructions = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Instruction.find(), query)

    const categoriesData = queryBuilder
        .search(InstructionSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        categoriesData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};
const getSingleInstruction = async (slug: string) => {
    const instruction = await Instruction.findOne({ slug });
    return {
        data: instruction,
    }
};



const updateInstruction = async (id: string, payload: Partial<IInstruction>) => {
    const existingInstruction = await Instruction.findById(id);
    if (!existingInstruction) {
        throw new Error("Instruction not found.");
    }

    if (payload.name) {
        const duplicateInstruction = await Instruction.findOne({
            name: payload.name,
            _id: { $ne: id },
        });
        if (duplicateInstruction) {
            throw new Error("An instruction with this name already exists.");
        }
    }
    const updatedInstruction = await Instruction.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    if (payload.thumbnail && existingInstruction.thumbnail && payload.thumbnail !== existingInstruction.thumbnail) {
        await deleteImageFromCLoudinary(existingInstruction.thumbnail).catch(console.error);
    }

    if (payload.pdfFile && existingInstruction.pdfFile && payload.pdfFile !== existingInstruction.pdfFile) {
        await deleteImageFromCLoudinary(existingInstruction.pdfFile).catch(console.error);
    }

    return updatedInstruction;
};

const deleteInstruction = async (id: string) => {
    const existingInstruction = await Instruction.findById(id);
    if (!existingInstruction) {
        throw new Error("Instruction not found.");
    }

    // Clean up both thumbnail and PDF from cloud storage
    if (existingInstruction.thumbnail) {
        await deleteImageFromCLoudinary(existingInstruction.thumbnail).catch(console.error);
    }
    if (existingInstruction.pdfFile) {
        await deleteImageFromCLoudinary(existingInstruction.pdfFile).catch(console.error);
    }

    await Instruction.findByIdAndDelete(id);
    return null;
};


export const InstructionService = {
    createInstruction,
    getAllInstructions,
    getSingleInstruction,
    updateInstruction,
    deleteInstruction,
};
