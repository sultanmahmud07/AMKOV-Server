"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionService = void 0;
/* eslint-disable no-console */
const cloudinary_config_1 = require("../../config/cloudinary.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const Instruction_constant_1 = require("./Instruction.constant");
const Instruction_model_1 = require("./Instruction.model");
const createInstruction = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // const existingInstruction = await Instruction.findOne({ name: payload.slug });
    // if (existingInstruction) {
    //     throw new Error("An instruction with this slug already exists.");
    // }
    const instruction = yield Instruction_model_1.Instruction.create(payload);
    return instruction;
});
const getAllInstructions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(Instruction_model_1.Instruction.find(), query);
    const categoriesData = queryBuilder
        .search(Instruction_constant_1.InstructionSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        categoriesData.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleInstruction = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const instruction = yield Instruction_model_1.Instruction.findOne({ slug });
    return {
        data: instruction,
    };
});
const updateInstruction = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingInstruction = yield Instruction_model_1.Instruction.findById(id);
    if (!existingInstruction) {
        throw new Error("Instruction not found.");
    }
    if (payload.name) {
        const duplicateInstruction = yield Instruction_model_1.Instruction.findOne({
            name: payload.name,
            _id: { $ne: id },
        });
        if (duplicateInstruction) {
            throw new Error("An instruction with this name already exists.");
        }
    }
    const updatedInstruction = yield Instruction_model_1.Instruction.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (payload.thumbnail && existingInstruction.thumbnail && payload.thumbnail !== existingInstruction.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingInstruction.thumbnail).catch(console.error);
    }
    if (payload.pdfFile && existingInstruction.pdfFile && payload.pdfFile !== existingInstruction.pdfFile) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingInstruction.pdfFile).catch(console.error);
    }
    return updatedInstruction;
});
const deleteInstruction = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingInstruction = yield Instruction_model_1.Instruction.findById(id);
    if (!existingInstruction) {
        throw new Error("Instruction not found.");
    }
    // Clean up both thumbnail and PDF from cloud storage
    if (existingInstruction.thumbnail) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingInstruction.thumbnail).catch(console.error);
    }
    if (existingInstruction.pdfFile) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(existingInstruction.pdfFile).catch(console.error);
    }
    yield Instruction_model_1.Instruction.findByIdAndDelete(id);
    return null;
});
exports.InstructionService = {
    createInstruction,
    getAllInstructions,
    getSingleInstruction,
    updateInstruction,
    deleteInstruction,
};
