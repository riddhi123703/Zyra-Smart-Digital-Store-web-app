import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { protect, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin
router.get("/", protect, requireAdmin, getAllOrders);
router.patch("/:id/status", protect, requireAdmin, updateOrderStatus);

export default router;
