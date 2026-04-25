import { model, Schema } from "mongoose";
import { IProduct, IProductVariation, ISpecification } from "./product.interface";

const productVariationSchema = new Schema<IProductVariation>({
  size: { type: String },
  color: { type: String },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number },
}, { _id: false });

const specificationSchema = new Schema<ISpecification>({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bulletPoints: { type: [String], default: [] },
    description: { type: String }, // Stores your HTML string
    metaTitle: { type: String },
    metaDescription: { type: String },
    specifications: { type: [specificationSchema], default: [] },
    images: { type: [String], default: [] },
    video: { type: String }, // Store the video URL directly
    deleteImages: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isMenu: { type: Boolean },
    isTrendy: { type: Boolean },
    featureImages: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    variations: [productVariationSchema],
    categories: [{
      type: Schema.Types.ObjectId,
      ref: "Category"
    }],
    orderBy: {
      type: Number,
      default: 9999 // Give un-ordered products a high number so they fall to the bottom
    },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);