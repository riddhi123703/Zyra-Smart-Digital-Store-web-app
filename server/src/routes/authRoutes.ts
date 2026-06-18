import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  refresh,
  getMe,
  updateMe,
  addAddress,
  deleteAddress,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/register",
  authLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 8 }).withMessage("Password min 8 chars"),
  ],
  validate,
  register,
);

// uncomment authLimiter when deploying

router.post(
  "/login",
  // authLimiter,
  [body("email").isEmail(), body("password").notEmpty()],
  validate,
  login,
);

router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.post("/me/addresses", protect, addAddress);
router.delete("/me/addresses/:addressId", protect, deleteAddress);

export default router;
