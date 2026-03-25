
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { IProduct } from './product.interface';
import { ProductService } from './product.service';

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Express.MulterS3.File[];

    const payload: IProduct = {
        ...req.body,
        images: files?.map(file => file.location), // ✅ S3 URLs
    };
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
    const payload: IProduct = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map(file => file.path)
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
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};