import { Router } from "express";
import { validateCoupon } from "../controllers/couponController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/validate", protect, validateCoupon);

export default router;
