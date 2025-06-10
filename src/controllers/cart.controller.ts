// src/controllers/cart.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { CustomRequest } from '../utils/jwt';

// GET /cart
export const getCart = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  res.json(cart);
};


// POST /cart/add
export const addToCart = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { productId, variantId, quantity } = req.body;

  if (!productId && !variantId) {
    res.status(400).json({ message: 'ProductId or VariantId required' });
    return;
  }

  // Get or create cart for user
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  // If variantId is provided, use it (and ignore productId)
  if (variantId) {
    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.isDeleted) {
       res.status(404).json({ message: 'Variant not found or deleted' });
       return
    }

    // Check if this variant is already in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity ?? 1) },
      });
      res.json(updated);
      return;
    }

    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity: quantity ?? 1,
      },
    });

    res.status(201).json(newItem);
    return;
  }

  // If only productId is provided (no variants)
  if (productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || product.isDeleted) {
       res.status(404).json({ message: 'Product not found or deleted' });
       return
    }


    // Check if this product is already in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity ?? 1) },
      });
      res.json(updated);
      return;
    }

    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: quantity ?? 1,
      },
    });

    res.status(201).json(newItem);
    return;
  }
};

// PUT /cart/update/:itemId
export const updateCartItem = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400).json({ message: 'Quantity must be at least 1' });
    return;
  }

  const item = await prisma.cartItem.findUnique({
    where: { id: Number(itemId) },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== userId) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  res.json(updated);
};

// DELETE /cart/remove/:itemId
export const removeCartItem = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { itemId } = req.params;

  const item = await prisma.cartItem.findUnique({
    where: { id: Number(itemId) },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== userId) {
    res.status(404).json({ message: 'Item not found' });
    return;
  }

  await prisma.cartItem.delete({ where: { id: item.id } });

  res.json({ message: 'Item removed from cart' });
};

// DELETE /cart/clear
export const clearCart = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    res.json({ message: 'Cart is already empty' });
    return;
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  res.json({ message: 'Cart cleared' });
};
