import { Request, Response } from "express";
import Coupon from "../models/Coupon";

export const validateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code, orderAmount, orderTotal } = req.body;
    const amount = orderAmount || orderTotal || 0;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Invalid coupon code" });
      return;
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      res.status(400).json({ success: false, message: "Coupon has expired" });
      return;
    }
    if (coupon.usedCount >= coupon.maxUses) {
      res
        .status(400)
        .json({ success: false, message: "Coupon usage limit reached" });
      return;
    }
    if (amount < coupon.minOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order ₹${coupon.minOrderAmount} required`,
      });
      return;
    }
    const discount =
      coupon.type === "percent"
        ? Math.round(amount * (coupon.value / 100) * 100) / 100
        : coupon.value;

    const finalAmount = Math.max(0, amount - discount);

    res.json({ success: true, coupon, discount, finalAmount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const payload = {
      ...req.body,
      code: String(req.body.code || "")
        .trim()
        .toUpperCase(),
      type: req.body.type,
      value: Number(req.body.value),
      minOrderAmount: Number(req.body.minOrderAmount ?? 0),
      maxUses: Number(req.body.maxUses ?? 1000),
      expiresAt: req.body.expiresAt || undefined,
      isActive: req.body.isActive ?? true,
    };

    const coupon = await Coupon.create(payload);
    res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getCoupons = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
