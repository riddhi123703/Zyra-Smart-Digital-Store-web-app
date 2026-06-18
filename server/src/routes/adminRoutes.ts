import { Router } from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
} from "../controllers/adminController";
import {
  validateCoupon,
  createCoupon,
  getCoupons,
  deleteCoupon,
} from "../controllers/couponController";
import { protect, requireAdmin } from "../middleware/auth";

const router = Router();

router.use(protect, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.get("/coupons", getCoupons);
router.post("/coupons", createCoupon);
router.delete("/coupons/:id", deleteCoupon);

export default router;
