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
exports.InstructionController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const Instruction_service_1 = require("./Instruction.service");
const createInstruction = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Cast req.files to handle the structure created by multer.fields()
    const files = req.files;
    // Safely extract the files
    const thumbnailFile = (_a = files === null || files === void 0 ? void 0 : files['thumbnail']) === null || _a === void 0 ? void 0 : _a[0];
    const pdfFile = (_b = files === null || files === void 0 ? void 0 : files['pdfFile']) === null || _b === void 0 ? void 0 : _b[0];
    const payload = Object.assign({}, req.body);
    if (thumbnailFile) {
        payload.thumbnail = thumbnailFile.location;
    }
    if (pdfFile) {
        payload.pdfFile = pdfFile.location;
    }
    //  console.log("Body data: ", payload)
    const result = yield Instruction_service_1.InstructionService.createInstruction(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Instruction created",
        data: result,
    });
}));
const getAllInstructions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield Instruction_service_1.InstructionService.getAllInstructions(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Instructions retrieved",
        data: result.data,
        meta: result.meta,
    });
}));
const deleteInstruction = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Instruction_service_1.InstructionService.deleteInstruction(req.params.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Instruction deleted",
        data: result,
    });
}));
exports.InstructionController = {
    createInstruction,
    getAllInstructions,
    deleteInstruction,
};
