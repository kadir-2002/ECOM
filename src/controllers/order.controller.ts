import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { CustomRequest } from '../middlewares/authenticate';
import { OrderStatus, PaymentStatus } from '@prisma/client';

type OrderItemInput = {
  productId?: number;
  variantId?: number;
  quantity: number;
  price: number;
};

// Create new order for authenticated user
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
     return
  }

  try {
    const createItems = items.map((item, idx) => {
      const hasProduct = typeof item.productId === 'number';
      const hasVariant = typeof item.variantId === 'number';

      if (!hasProduct && !hasVariant) {
        throw new Error(`Item ${idx + 1}: Must have either productId or variantId.`);
      }

      if (hasProduct && hasVariant) {
        throw new Error(`Item ${idx + 1}: Cannot have both productId and variantId.`);
      }

      return {
        productId: hasProduct ? item.productId : null,
        variantId: hasVariant ? item.variantId : null,
        quantity: item.quantity,
        price: item.price,
      };
    });

    const payment = await prisma.payment.create({
      data: {
        method: paymentMethod,
        status: PaymentStatus.PENDING,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        addressId,
        totalAmount,
        status: OrderStatus.PENDING,
        paymentId: payment.id,
        items: {
          create: createItems,
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order failed:', error);
    res.status(500).json({ message: 'Failed to create order', error });
  }
};

// Get orders for logged in user
export const getUserOrders = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
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
    console.error('Fetch orders failed:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error });
  }
};

// Get a specific order by ID for the logged-in user
export const getOrderById = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return;
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: Number(id),
        userId,
      },
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
    });

    if (!order) {
       res.status(404).json({ message: 'Order not found' });
        return;
    }

    res.json(order);
  } catch (error) {
    console.error('Fetch order by ID failed:', error);
    res.status(500).json({ message: 'Failed to fetch order', error });
  }
};
