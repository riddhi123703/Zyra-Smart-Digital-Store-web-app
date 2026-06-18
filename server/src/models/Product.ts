import mongoose, { Document, Schema } from "mongoose";

export interface IStockEntry {
  size: string;
  color: string;
  quantity: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  sizes: string[];
  colors: string[];
  stock: IStockEntry[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  numReviews: number;
}

const stockSchema = new Schema<IStockEntry>({
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
});

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: [stockSchema],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, price: 1 });

export default mongoose.model<IProduct>("Product", productSchema);
