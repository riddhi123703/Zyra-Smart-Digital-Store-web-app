import { Request, Response } from "express";
import Wishlist from "../models/Wishlist";

export const getWishlist = async (req: any, res: Response): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name slug price images averageRating",
    );
    res.json({ success: true, products: wishlist?.products || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToWishlist = async (req: any, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { products: productId } },
      { new: true, upsert: true },
    ).populate("products", "name slug price images averageRating");
    res.json({ success: true, products: wishlist.products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeFromWishlist = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: req.params.productId } },
      { new: true },
    ).populate("products", "name slug price images averageRating");
    res.json({ success: true, products: wishlist?.products || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
