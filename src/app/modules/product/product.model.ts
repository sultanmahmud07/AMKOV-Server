import { model, Schema } from "mongoose";
import { IProduct, IProductVariation } from "./product.interface";

const productVariationSchema = new Schema<IProductVariation>({
  size: { type: String },
  color: { type: String },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number }, // if not provided, use basePrice
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    images: { type: [String], default: [] },
    deleteImages: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    variations: [productVariationSchema],
    category: { type: String },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);