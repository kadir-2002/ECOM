import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { CustomRequest } from '../utils/jwt';
import { OrderStatus, PaymentStatus } from '@prisma/client';

type OrderItemInput = {
  productId: number;
  variantId?: number;
  quantity: number;
  price: number;
};

// Create new order
export const createOrder = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    items,
    addressId,
    totalAmount,
    paymentMethod,
  }: {
    items: OrderItemInput[];
    addressId: number;
    totalAmount: number;
    paymentMethod: string;
  } = req.body;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    // Create payment record (initially PENDING)
    const payment = await prisma.payment.create({
      data: {
        method: paymentMethod,
        status: PaymentStatus.PENDING, // OR 'PENDING' as PaymentStatus
      },
    });

    // Create order with nested order items
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        status: OrderStatus.PENDING, // OR 'PENDING' as OrderStatus
        addressId,
        paymentId: payment.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order', error });
  }
};

// Get orders for logged in user
export const getUserOrders = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        payment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
};
