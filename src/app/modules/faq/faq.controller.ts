import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { FaqService } from "./faq.service";

const createFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqService.createFaq(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "FAQ created successfully",
        data: result,
    });
});

const getAllFaqs = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqService.getAllFaqs(req.query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQs retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqService.getSingleFaq(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQ retrieved successfully",
        data: result,
    });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqService.updateFaq(req.params.id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQ updated successfully",
        data: result,
    });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqService.deleteFaq(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQ deleted successfully",
        data: result,
    });
});

export const FaqController = {
    createFaq,
    getAllFaqs,
    getSingleFaq,
    updateFaq,
    deleteFaq
};