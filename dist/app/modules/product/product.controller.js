"use strict";
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
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
exports.ProductController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const product_service_1 = require("./product.service");
const createProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Cast req.files to handle the structure created by multer.fields()
    const files = req.files;
    // Safely extract the arrays (default to empty array if undefined)
    const galleryFiles = (files === null || files === void 0 ? void 0 : files['images']) || [];
    const featureFiles = (files === null || files === void 0 ? void 0 : files['featureImages']) || [];
    const videoFiles = (files === null || files === void 0 ? void 0 : files['video']) || [];
    const payload = Object.assign(Object.assign({}, req.body), { images: galleryFiles.map(file => file.location), featureImages: featureFiles.map(file => file.location) });
    // Safely check if a video was actually uploaded before adding it to payload
    if (videoFiles.length > 0) {
        payload.video = videoFiles[0].location; // <-- Grab the S3 URL of the first (and only) video
    }
    const result = yield product_service_1.ProductService.createProduct(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
}));
const getAllProducts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield product_service_1.ProductService.getAllProducts(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Products retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getProductShortInfo = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield product_service_1.ProductService.getProductShortInfo(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Products short info retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getRelativeProducts = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield product_service_1.ProductService.getRelativeProducts(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Relative products retrieved successfully',
        data: result.data,
        meta: result.meta,
    });
}));
const getSingleProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield product_service_1.ProductService.getSingleProduct(slug);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Product retrieved successfully',
        data: result,
    });
}));
const updateProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const galleryFiles = (files === null || files === void 0 ? void 0 : files['images']) || [];
    const featureFiles = (files === null || files === void 0 ? void 0 : files['featureImages']) || [];
    const videoFiles = (files === null || files === void 0 ? void 0 : files['video']) || [];
    // 1. Safely extract existing images from req.body (FormData can send string or array)
    let existingImages = [];
    if (req.body.images) {
        existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }
    let existingFeatureImages = [];
    if (req.body.featureImages) {
        existingFeatureImages = Array.isArray(req.body.featureImages) ? req.body.featureImages : [req.body.featureImages];
    }
    // 2. Use Partial<IProduct> since an update might not include every required field
    const payload = Object.assign(Object.assign({}, req.body), { 
        // 3. MERGE the existing images with the newly uploaded ones
        images: [...existingImages, ...galleryFiles.map(file => file.location)], featureImages: [...existingFeatureImages, ...featureFiles.map(file => file.location)] });
    // 4. Handle Video safely
    if (videoFiles.length > 0) {
        payload.video = videoFiles[0].location; // New video uploaded
    }
    else if (req.body.video) {
        payload.video = req.body.video; // Keep existing video
    }
    const result = yield product_service_1.ProductService.updateProduct(req.params.id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Product updated successfully',
        data: result,
    });
}));
const deleteProduct = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield product_service_1.ProductService.deleteProduct(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Product deleted successfully',
        data: result,
    });
}));
exports.ProductController = {
    createProduct,
    getAllProducts,
    getProductShortInfo,
    getRelativeProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
};
