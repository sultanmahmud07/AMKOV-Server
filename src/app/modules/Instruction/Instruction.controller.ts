/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { InstructionService } from "./Instruction.service";
import { IInstruction } from "./Instruction.interface";

const createInstruction = catchAsync(async (req: Request, res: Response) => {
    // Cast req.files to handle the structure created by multer.fields()
    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };
    // Safely extract the files
    const thumbnailFile = files?.['thumbnail']?.[0];
    const pdfFile = files?.['pdfFile']?.[0];

    const payload: Partial<IInstruction> = {
        ...req.body,
    };

    if (thumbnailFile) {
        payload.thumbnail = thumbnailFile.location;
    }

    if (pdfFile) {
        payload.pdfFile = pdfFile.location;
    }
    //  console.log("Body data: ", payload)
    const result = await InstructionService.createInstruction(payload as IInstruction);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Instruction created",
        data: result,
    });
});

const getAllInstructions = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await InstructionService.getAllInstructions(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Instructions retrieved",
        data: result.data,
        meta: result.meta,
    });
});

const deleteInstruction = catchAsync(async (req: Request, res: Response) => {
    const result = await InstructionService.deleteInstruction(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Instruction deleted",
        data: result,
    });
});

export const InstructionController = {
    createInstruction,
    getAllInstructions,
    deleteInstruction,
};
