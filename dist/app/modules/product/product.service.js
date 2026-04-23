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
exports.ProductService = void 0;
const aws_config_1 = require("../../config/aws.config");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const category_model_1 = require("../category/category.model");
const product_constant_1 = require("./product.constant");
const product_model_1 = require("./product.model");
const createProduct = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProduct = yield product_model_1.Product.findOne({ slug: payload.slug });
    if (existingProduct) {
        throw new Error("A Product with this slug already exists.");
    }
    const product = yield product_model_1.Product.create(payload);
    return product;
});
const getAllProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryObj = Object.assign({}, query);
    if (queryObj.category_slug) {
        const category = yield category_model_1.Category.findOne({ slug: queryObj.category_slug }).select('_id');
        if (!category) {
            return {
                data: [],
                meta: {
                    page: Number(queryObj.page) || 1,
                    limit: Number(queryObj.limit) || 10,
                    total: 0,
                    totalPage: 0
                }
            };
        }
        queryObj.category = category._id.toString();
        delete queryObj.category_slug;
    }
    const queryBuilder = new QueryBuilder_1.QueryBuilder(product_model_1.Product.find().populate('category'), queryObj);
    const products = yield queryBuilder
        .search(product_constant_1.productSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        products.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getProductShortInfo = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const baseQuery = product_model_1.Product.find().select('_id name images slug description');
    const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, query);
    const products = yield queryBuilder
        .search(product_constant_1.productSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        products.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
// Ensure you import mongoose if you need to validate ObjectIds
// import mongoose from 'mongoose';
const getRelativeProducts = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Clone the query so we don't mutate the original request
    const queryObj = Object.assign({}, query);
    // 2. Extract necessary variables for the related products logic
    const { category_id, current_product_id } = queryObj;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterConditions = {};
    // Filter by the provided category
    if (category_id) {
        filterConditions.category = category_id;
        // Delete it from queryObj so QueryBuilder doesn't process it redundantly
        delete queryObj.category_id;
    }
    // Skip the current product
    if (current_product_id) {
        // Use MongoDB's $ne (not equal) operator
        filterConditions._id = { $ne: current_product_id };
        // Delete it from queryObj
        delete queryObj.current_product_id;
    }
    // 4. Create the base query with the applied filters and .select()
    const baseQuery = product_model_1.Product.find(filterConditions)
        .select('_id name images slug description')
        .populate('category');
    // 5. Pass the pre-filtered query into the QueryBuilder
    const queryBuilder = new QueryBuilder_1.QueryBuilder(baseQuery, queryObj);
    // Let the QueryBuilder handle search, sort, fields, and pagination
    const products = yield queryBuilder
        .search(product_constant_1.productSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        products.build(), // or products.modelQuery depending on your setup
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleProduct = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield product_model_1.Product.findOne({ slug }).populate('category');
    return {
        data: tour,
    };
});
const updateProduct = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProduct = yield product_model_1.Product.findById(id);
    if (!existingProduct) {
        throw new Error("Product not found.");
    }
    // Initialize arrays to prevent undefined errors
    payload.deleteImages = payload.deleteImages || [];
    const newGalleryUploads = payload.images || [];
    const newFeatureUploads = payload.featureImages || [];
    // --- 1. HANDLE VIDEO REPLACEMENT ---
    // If a new video is uploaded, ensure the old one is deleted from the cloud
    if (payload.video && existingProduct.video && payload.video !== existingProduct.video) {
        payload.deleteImages.push(existingProduct.video);
    }
    // --- 2. HANDLE IMAGES (Gallery & Features) ---
    const finalGalleryImages = [...(existingProduct.images || []), ...newGalleryUploads]
        .filter(url => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(url)); });
    const finalFeatureImages = [...(existingProduct.featureImages || []), ...newFeatureUploads]
        .filter(url => { var _a; return !((_a = payload.deleteImages) === null || _a === void 0 ? void 0 : _a.includes(url)); });
    // Use a Set to guarantee there are absolutely no duplicate URLs in the database
    payload.images = Array.from(new Set(finalGalleryImages));
    payload.featureImages = Array.from(new Set(finalFeatureImages));
    // --- 3. DATABASE UPDATE ---
    // Added runValidators: true to ensure Zod/Mongoose rules are enforced on updates
    const updatedProduct = yield product_model_1.Product.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    // --- 4. CLOUD STORAGE CLEANUP ---
    if (payload.deleteImages.length > 0) {
        // We drop the 'await' here so the API responds instantly to the frontend.
        // The server will delete the AWS S3 / Cloudinary files silently in the background.
        Promise.all(payload.deleteImages.map(url => (0, aws_config_1.deleteFileFromS3)(url)))
            // eslint-disable-next-line no-console
            .catch(err => console.error("Background cloud deletion failed:", err));
    }
    return updatedProduct;
});
const deleteProduct = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingProduct = yield product_model_1.Product.findById(id);
    if (!existingProduct) {
        throw new Error("Product not found.");
    }
    if (existingProduct.images && Array.isArray(existingProduct.images) && existingProduct.images.length) {
        const imageUrls = existingProduct.images.map(file => file);
        yield Promise.all(imageUrls.map(url => (0, aws_config_1.deleteFileFromS3)(url)));
    }
    if (existingProduct.featureImages && Array.isArray(existingProduct.featureImages) && existingProduct.featureImages.length) {
        const featureImageUrls = existingProduct.featureImages.map(file => file);
        yield Promise.all(featureImageUrls.map(url => (0, aws_config_1.deleteFileFromS3)(url)));
    }
    if (existingProduct.video) {
        yield (0, aws_config_1.deleteFileFromS3)(existingProduct.video);
    }
    yield product_model_1.Product.findByIdAndDelete(id);
    return null;
});
exports.ProductService = {
    createProduct,
    getSingleProduct,
    getAllProducts,
    getRelativeProducts,
    getProductShortInfo,
    updateProduct,
    deleteProduct,
};
