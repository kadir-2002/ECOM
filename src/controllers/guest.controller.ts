// src/controllers/guest.controller.ts
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const guestCheckout = async (req: Request, res: Response) => {
  const {
    email,
    address,
    items,
    totalAmount,
    paymentMethod,
  }: {
    email: string;
    address: {
      fullName: string;
      phone: string;
      pincode: string;
      state: string;
      city: string;
      addressLine: string;
      landmark?: string;
    };
    items: {
      productId?: number;
      variantId?: number;
      quantity: number;
      price: number;
    }[];
    totalAmount: number;
    paymentMethod: string;
  } = req.body;

  try {
    // Validate items: must have either productId or variantId (not both or neither)
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

    let guestUser = await prisma.user.findFirst({
      where: {
        email,
        isGuest: true,
      },
    });

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          email,
          isGuest: true,
        },
      });
    }

    const savedAddress = await prisma.address.create({
      data: {
        userId: guestUser.id,
        type: 'SHIPPING',
        isDefault: true,
        ...address,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        method: paymentMethod,
        status: PaymentStatus.PENDING,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: guestUser.id,
        addressId: savedAddress.id,
        totalAmount,
        status: OrderStatus.PENDING,
        paymentId: payment.id,
        items: {
          create: createItems,
        },
      },
      include: {
        items: true,
        address: true,
        payment: true,
      },
    });

    res.status(201).json({ message: 'Guest order placed', order });
  } catch (error) {
    console.error('Guest checkout failed:', error);
    res.status(500).json({ message: 'Guest checkout failed', error });
  }
};
