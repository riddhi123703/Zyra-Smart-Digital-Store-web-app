import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItem extends Document {
  product: mongoose.Types.ObjectId;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image: string;
  name: string;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: Types.DocumentArray<ICartItem>;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  name: { type: String, required: true },
});

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    items: [cartItemSchema],
  },
  { timestamps: true },
);

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });

export default mongoose.model<ICart>("Cart", cartSchema);
