import { Request, Response } from "express";
import Review from "../models/Review";
import Product from "../models/Product";

export const createReview = async (req: any, res: Response): Promise<void> => {
  try {
    const { productId, rating, title, body } = req.body;
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existing) {
      res
        .status(409)
        .json({ success: false, message: "You already reviewed this product" });
      return;
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      body,
    });

    // Recalculate product rating
    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      {
        $group: {
          _id: "$product",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(stats[0].avg * 10) / 10,
        numReviews: stats[0].count,
      });
    }

    const populated = await review.populate("user", "name avatar");
    res.status(201).json({ success: true, review: populated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteReview = async (req: any, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found" });
      return;
    }
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403).json({ success: false, message: "Not authorized" });
      return;
    }
    await review.deleteOne();
    res.json({ success: true, message: "Review removed" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
