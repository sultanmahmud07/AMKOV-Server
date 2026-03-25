
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { tourSearchableFields } from "./product.constant";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";

const createProduct = async (payload: IProduct) => {
    const existingProduct = await Product.findOne({ title: payload.slug });
    if (existingProduct) {
        throw new Error("A Product with this slug already exists.");
    }

    const product = await Product.create(payload)

    return product;
};

const getAllProducts = async (query: Record<string, string>) => {


    const queryBuilder = new QueryBuilder(Product.find(), query)

    const tours = await queryBuilder
        .search(tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])


    return {
        data,
        meta
    }
};
const getSingleProduct = async (slug: string) => {
    const tour = await Product.findOne({ slug });
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
    updateProduct,
    deleteProduct,
};
