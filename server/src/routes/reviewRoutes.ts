import { Router } from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
} from "../controllers/reviewController";
import { protect, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/", protect, createReview);
router.get("/product/:productId", getProductReviews);
router.delete("/:id", protect, deleteReview);

export default router;
