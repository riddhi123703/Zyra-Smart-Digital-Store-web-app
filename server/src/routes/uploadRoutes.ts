import { Router } from "express";
import multer from "multer";
import { uploadImage, deleteImage } from "../controllers/uploadController";
import { protect, requireAdmin } from "../middleware/auth";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.post("/", protect, requireAdmin, upload.single("image"), uploadImage);
router.delete("/", protect, requireAdmin, deleteImage);

export default router;
