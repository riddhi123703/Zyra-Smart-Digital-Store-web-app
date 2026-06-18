import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Product from "../models/Product";
import Category from "../models/Category";

const categories = [
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Accessories", slug: "accessories" },
];

const products = [
  {
    name: "Classic White T-Shirt",
    slug: "classic-white-tshirt",
    description: "A premium quality white cotton t-shirt for everyday comfort.",
    price: 999,
    comparePrice: 1299,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["white"],
    stock: [
      { size: "S", color: "white", quantity: 10 },
      { size: "M", color: "white", quantity: 15 },
    ],
    tags: ["men", "casual", "cotton"],
    isFeatured: true,
  },
  {
    name: "Summer Floral Dress",
    slug: "summer-floral-dress",
    description: "Elegant floral dress perfect for summer outings.",
    price: 2499,
    comparePrice: 2999,
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800"],
    sizes: ["S", "M", "L"],
    colors: ["pink", "blue"],
    stock: [
      { size: "M", color: "pink", quantity: 5 },
    ],
    tags: ["women", "summer", "floral"],
    isFeatured: true,
  },
  {
    name: "Canvas Backpack",
    slug: "canvas-backpack",
    description: "Durable canvas backpack with multiple compartments.",
    price: 1899,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"],
    sizes: ["one-size"],
    colors: ["khaki", "black"],
    stock: [
      { size: "one-size", color: "black", quantity: 20 },
    ],
    tags: ["accessories", "travel", "bag"],
    isFeatured: false,
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("Existing data cleared.");

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created.`);

    // Map products to category IDs
    const productsToInsert = products.map(p => {
      let catName = "";
      if (p.tags.includes("men")) catName = "Men";
      else if (p.tags.includes("women")) catName = "Women";
      else catName = "Accessories";

      const cat = createdCategories.find(c => c.name === catName);
      return { ...p, category: cat?._id };
    });

    // Insert products
    const createdProducts = await Product.insertMany(productsToInsert);
    console.log(`${createdProducts.length} products created.`);

    console.log("Database seeded successfully! 🌱");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
