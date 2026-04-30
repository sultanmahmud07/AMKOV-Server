/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { IProduct } from './product.interface';
import { ProductService } from './product.service';

// const fixOrderDefaults = async (req: Request, res: Response) => {
//     try {
//         // Find products that still have the old 'category' field
//         const result = await Product.updateMany(
//             { category: { $exists: true, $ne: null } },
//             [
//                 // Step 1: Set the new 'categories' array using the value of the old 'category'
//                 { $set: { categories: ["$category"] } },

//                 // Step 2: Completely remove the old 'category' field to clean up the database
//                 { $unset: "category" }
//             ]
//         );

//         res.status(200).json({
//             success: true,
//             message: `Successfully migrated categories for ${result.modifiedCount} products.`,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Failed to migrate categories.",
//             error
//         });
//     }
// };
const createProduct = catchAsync(async (req: Request, res: Response) => {
    // Cast req.files to handle the structure created by multer.fields()
    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };

    // Safely extract the arrays (default to empty array if undefined)
    const galleryFiles = files?.['images'] || [];
    const featureFiles = files?.['featureImages'] || [];
    const videoFiles = files?.['video'] || [];
    const payload: IProduct = {
        ...req.body,
        images: galleryFiles.map(file => file.location), // S3 URLs for Gallery
        featureImages: featureFiles.map(file => file.location), // S3 URLs for Features tab
    };
    // Safely check if a video was actually uploaded before adding it to payload
    if (videoFiles.length > 0) {
        payload.video = videoFiles[0].location; // <-- Grab the S3 URL of the first (and only) video
    }
    const result = await ProductService.createProduct(payload);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
});

const getAllProducts = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await ProductService.getAllProducts(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Products retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getProductShortInfo = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await ProductService.getProductShortInfo(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Products short info retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});
const getRelativeProducts = catchAsync(async (req: Request, res: Response) => {

    const query = req.query
    const result = await ProductService.getRelativeProducts(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Relative products retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
});

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug
    const result = await ProductService.getSingleProduct(slug);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product retrieved successfully',
        data: result,
    });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.MulterS3.File[] };
    const galleryFiles = files?.['images'] || [];
    const featureFiles = files?.['featureImages'] || [];
    const videoFiles = files?.['video'] || [];

    // 1. Safely extract existing images from req.body (FormData can send string or array)
    let existingImages: string[] = [];
    if (req.body.images) {
        existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    let existingFeatureImages: string[] = [];
    if (req.body.featureImages) {
        existingFeatureImages = Array.isArray(req.body.featureImages) ? req.body.featureImages : [req.body.featureImages];
    }

    // 2. Use Partial<IProduct> since an update might not include every required field
    const payload: Partial<IProduct> = {
        ...req.body,
        // 3. MERGE the existing images with the newly uploaded ones
        images: [...existingImages, ...galleryFiles.map(file => file.location)],
        featureImages: [...existingFeatureImages, ...featureFiles.map(file => file.location)],
    };

    // 4. Handle Video safely
    if (videoFiles.length > 0) {
        payload.video = videoFiles[0].location; // New video uploaded
    } else if (req.body.video) {
        payload.video = req.body.video; // Keep existing video
    }

    const result = await ProductService.updateProduct(req.params.id, payload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product updated successfully',
        data: result,
    });
});
const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await ProductService.deleteProduct(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
});
export const ProductController = {
    // fixOrderDefaults,
    createProduct,
    getAllProducts,
    getProductShortInfo,
    getRelativeProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};