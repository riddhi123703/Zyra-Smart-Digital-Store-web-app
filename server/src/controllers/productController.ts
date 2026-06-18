import { Request, Response } from "express";
import Product from "../models/Product";
import Category from "../models/Category";
import Review from "../models/Review";
import mongoose from "mongoose";

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sizes,
      colors,
      sort,
      page = "1",
      limit = "12",
      featured,
    } = req.query;

    const filter: any = { isActive: true };
    
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category as string)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category as string });
        if (cat) filter.category = cat._id;
        else filter.category = new mongoose.Types.ObjectId(); // No category found with this slug
      }
    }
    if (featured === "true") filter.isFeatured = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (sizes) filter.sizes = { $in: (sizes as string).split(",") };
    if (colors) filter.colors = { $in: (colors as string).split(",") };
    if (search) filter.$text = { $search: search as string };

    let sortOption: any = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    else if (sort === "price-desc") sortOption = { price: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "rating") sortOption = { averageRating: -1 };

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params as { slug: string };
    const query = mongoose.Types.ObjectId.isValid(slug)
      ? { _id: slug, isActive: true }
      : { slug, isActive: true };

    const product = await Product.findOne(query).populate("category", "name slug");

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    const reviews = await Review.find({ product: product._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, product, reviews });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Validate required category
    if (!req.body.category) {
      res.status(400).json({ success: false, message: "Category is required" });
      return;
    }

    // Auto-generate slug from name if not provided
    if (!req.body.slug && req.body.name) {
      const base = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const suffix = Math.random().toString(36).substring(2, 8);
      req.body.slug = `${base}-${suffix}`;
    }
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, message: "Product deactivated" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
