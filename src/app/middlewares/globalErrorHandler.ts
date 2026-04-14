/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handleCastError } from "../helpers/handleCastError";
import { handlerDuplicateError } from "../helpers/handleDuplicateError";
import { handlerValidationError } from "../helpers/handlerValidationError";
import { handlerZodError } from "../helpers/handlerZodError";
import { TErrorSources } from "../interfaces/error.types";
import { deleteFileFromS3 } from "../config/aws.config";

export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.log(err);
    }
   try {
        // 1. Handle multer.single() uploads
        if (req?.file) {
            const fileKey = (req.file as any).key;
            if (fileKey) await deleteFileFromS3(fileKey);
        }

        // 2. Handle file uploads (Array or Object)
        if (req?.files) {
            let fileKeys: string[] = [];

            if (Array.isArray(req.files)) {
                // A. Handle multer.array() -> req.files is a direct array
                fileKeys = (req.files as any[]).map((file) => file.key);
            } else {
                // B. Handle multer.fields() -> req.files is an object of arrays
                // Object.values extracts the arrays, and .flat() merges them into one single array
                const filesObject = req.files as { [fieldname: string]: any[] };
                const allFiles = Object.values(filesObject).flat();
                fileKeys = allFiles.map((file) => file.key);
            }

            // Clean up any undefined keys just in case, then delete from S3
            const validKeys = fileKeys.filter(Boolean);
            if (validKeys.length > 0) {
                await Promise.all(validKeys.map((key) => deleteFileFromS3(key)));
            }
        }
    } catch (cleanupError) {
        console.error("Failed to clean up S3 files during error handling:", cleanupError);
    }
    let errorSources: TErrorSources[] = []
    let statusCode = 500
    let message = "Something Went Wrong!!"

    //Duplicate error
    if (err.code === 11000) {
        const simplifiedError = handlerDuplicateError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    // Object ID error / Cast Error
    else if (err.name === "CastError") {
        const simplifiedError = handleCastError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message
    }
    else if (err.name === "ZodError") {
        const simplifiedError = handlerZodError(err)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = simplifiedError.errorSources as TErrorSources[]
    }
    //Mongoose Validation Error
    else if (err.name === "ValidationError") {
        const simplifiedError = handlerValidationError(err)
        statusCode = simplifiedError.statusCode;
        errorSources = simplifiedError.errorSources as TErrorSources[]
        message = simplifiedError.message
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode
        message = err.message
    } else if (err instanceof Error) {
        statusCode = 500;
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        err: envVars.NODE_ENV === "development" ? err : null,
        stack: envVars.NODE_ENV === "development" ? err.stack : null
    })
}