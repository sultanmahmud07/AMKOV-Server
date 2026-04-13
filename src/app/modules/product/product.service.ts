
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Category } from "../category/category.model";
import { productSearchableFields } from "./product.constant";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";

const createProduct = async (payload: IProduct) => {
    const existingProduct = await Product.findOne({ slug: payload.slug });
    if (existingProduct) {
        throw new Error("A Product with this slug already exists.");
    }

    const product = await Product.create(payload)

    return product;
};

const getAllProducts = async (query: Record<string, string>) => {
    const queryObj = { ...query };
    if (queryObj.category_slug) {
        const category = await Category.findOne({ slug: queryObj.category_slug }).select('_id');

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
    const queryBuilder = new QueryBuilder(Product.find().populate('category'), queryObj)

    const products = await queryBuilder
        .search(productSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        products.build(),
        queryBuilder.getMeta()
    ])


    return {
        data,
        meta
    }
};
const getProductShortInfo = async (query: Record<string, string>) => {
    const baseQuery = Product.find().select('_id name images slug description');

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const products = await queryBuilder
        .search(productSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        products.build(),
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    };
};
// Ensure you import mongoose if you need to validate ObjectIds
// import mongoose from 'mongoose';

const getRelativeProducts = async (query: Record<string, string>) => {
    // 1. Clone the query so we don't mutate the original request
    const queryObj = { ...query };

    // 2. Extract necessary variables for the related products logic
    const { category_id, current_product_id } = queryObj;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterConditions: Record<string, any> = {};

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
    const baseQuery = Product.find(filterConditions)
                             .select('_id name images slug description')
                             .populate('category');

    // 5. Pass the pre-filtered query into the QueryBuilder
    const queryBuilder = new QueryBuilder(baseQuery, queryObj);

    // Let the QueryBuilder handle search, sort, fields, and pagination
    const products = await queryBuilder
        .search(productSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        products.build(), // or products.modelQuery depending on your setup
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    };
};


const getSingleProduct = async (slug: string) => {
    const tour = await Product.findOne({ slug }).populate('category');
    return {
        data: tour,
    }
};
const updateProduct = async (id: string, payload: Partial<IProduct>) => {

    const existingTour = await Product.findById(id);

    if (!existingTour) {
        throw new Error("Tour not found.");
    }

    if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images]
    }

    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {

        const restDBImages = existingTour.images.filter(imageUrl => !payload.deleteImages?.includes(imageUrl))

        const updatedPayloadImages = (payload.images || [])
            .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
            .filter(imageUrl => !restDBImages.includes(imageUrl))

        payload.images = [...restDBImages, ...updatedPayloadImages]


    }

    const updatedTour = await Product.findByIdAndUpdate(id, payload, { new: true });

    if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        await Promise.all(payload.deleteImages.map(url => deleteImageFromCLoudinary(url)))
    }

    return updatedTour;
};
const deleteProduct = async (id: string) => {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
        throw new Error("Product not found.");
    }

    if (existingProduct.images && Array.isArray(existingProduct.images) && existingProduct.images.length) {
        const imageUrls = existingProduct.images.map(file => file);
        await Promise.all(imageUrls.map(url => deleteImageFromCLoudinary(url)))
    }
    await Product.findByIdAndDelete(id);
    return null;

};

export const ProductService = {
    createProduct,
    getSingleProduct,
    getAllProducts,
    getRelativeProducts,
    getProductShortInfo,
    updateProduct,
    deleteProduct,
};
