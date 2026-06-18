import { Request, Response } from "express";
import Stripe from "stripe";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Coupon from "../models/Coupon";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export const createOrder = async (req: any, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, couponCode, paymentMethod } = req.body;
    const resolvedPaymentMethod = paymentMethod || "cod";

    let discountAmount = 0;
    let coupon = null;

    const itemsPrice = items.reduce(
      (acc: number, i: any) => acc + i.price * i.quantity,
      0,
    );
    const shippingPrice = itemsPrice > 999 ? 0 : 99;
    const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });
      if (coupon) {
        if (coupon.usedCount >= coupon.maxUses) {
          res
            .status(400)
            .json({ success: false, message: "Coupon usage limit reached" });
          return;
        }
        if (itemsPrice < coupon.minOrderAmount) {
          res.status(400).json({
            success: false,
            message: `Minimum order ₹${coupon.minOrderAmount} required`,
          });
          return;
        }
        discountAmount =
          coupon.type === "percent"
            ? Math.round(itemsPrice * (coupon.value / 100) * 100) / 100
            : coupon.value;
      }
    }

    const totalPrice = Math.max(
      0,
      itemsPrice + shippingPrice + taxPrice - discountAmount,
    );

    let paymentIntentId: string | undefined;
    let clientSecret: string | undefined;
    let isPaid = false;
    let paidAt: Date | undefined;

    if (resolvedPaymentMethod === "stripe") {
      if (!stripe) {
        res
          .status(400)
          .json({ success: false, message: "Stripe is not configured" });
        return;
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100),
        currency: "inr",
        metadata: { userId: req.user._id.toString() },
      });
      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret || undefined;
    }

    if (resolvedPaymentMethod === "dummy") {
      isPaid = true;
      paidAt = new Date();
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: resolvedPaymentMethod,
      paymentIntentId,
      isPaid,
      paidAt,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      couponCode: coupon?.code,
      totalPrice,
    });

    // Clear cart after order
    await Cart.findOneAndDelete({ user: req.user._id });

    // Increment coupon usage
    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    }

    res.status(201).json({
      success: true,
      order,
      clientSecret,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyOrders = async (req: any, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrderById = async (req: any, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin
export const getAllOrders = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status, trackingNumber } = req.body;
    const update: any = { orderStatus: status };
    if (status === "delivered") {
      update.isDelivered = true;
      update.deliveredAt = new Date();
    }
    if (trackingNumber) update.trackingNumber = trackingNumber;
    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stripe webhook
export const stripeWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!stripe) {
    res.status(400).json({ message: "Stripe is not configured" });
    return;
  }
  const sig = req.headers["stripe-signature"] as string;
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      await Order.findOneAndUpdate(
        { paymentIntentId: pi.id },
        { isPaid: true, paidAt: new Date(), orderStatus: "processing" },
      );
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }
};
