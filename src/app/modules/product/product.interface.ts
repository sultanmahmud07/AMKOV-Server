import { Types } from "mongoose";

export interface IProductVariation {
  size?: string;   // e.g., L, XL, XXL
  color?: string;  // e.g., black, green, red
  stock: number;   // available stock for this variation
  price: number;   // variation-specific price (optional)
}

export interface IProduct {
  name: string;
  slug: string;
  description?: string;
  images?: string[];
  basePrice: number; // default/base price
  variations: IProductVariation[];
  category?: Types.ObjectId;
   deleteImages?: string[]
  createdAt: Date;
  updatedAt: Date;
}
