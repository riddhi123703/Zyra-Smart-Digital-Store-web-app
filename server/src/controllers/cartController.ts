import { Request, Response } from "express";
import Cart from "../models/Cart";

const getCartQuery = (req: any) =>
  req.user ? { user: req.user._id } : { sessionId: req.cookies.sessionId };

export const getCart = async (req: any, res: Response): Promise<void> => {
  try {
    const cart = await Cart.findOne(getCartQuery(req)).populate(
      "items.product",
      "name images price stock",
    );
    res.json({ success: true, cart: cart || { items: [] } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addToCart = async (req: any, res: Response): Promise<void> => {
  try {
    const { productId, size, color, quantity, price, image, name } = req.body;
    const query = getCartQuery(req);
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({ ...query, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (i) =>
        i.product.toString() === productId &&
        i.size === size &&
        i.color === color,
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        size,
        color,
        quantity,
        price,
        image,
        name,
      });
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCartItem = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne(getCartQuery(req));
    if (!cart) {
      res.status(404).json({ success: false, message: "Cart not found" });
      return;
    }
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      res.status(404).json({ success: false, message: "Item not found" });
      return;
    }
    item.quantity = quantity;
    await cart.save();
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeCartItem = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const cart = await Cart.findOne(getCartQuery(req));
    if (!cart) {
      res.status(404).json({ success: false, message: "Cart not found" });
      return;
    }
    cart.items = cart.items.filter(
      (i) => i._id?.toString() !== req.params.itemId,
    ) as any;
    await cart.save();
    res.json({ success: true, cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearCart = async (req: any, res: Response): Promise<void> => {
  try {
    await Cart.findOneAndDelete(getCartQuery(req));
    res.json({ success: true, message: "Cart cleared" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
