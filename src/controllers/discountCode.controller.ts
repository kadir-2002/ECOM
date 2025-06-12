import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const getUserDiscountCodes = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  try {
    const codes = await prisma.discountCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(codes);
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const redeemDiscountCode = async (req: Request, res: Response) => {
  const { code } = req.body;
  const userId = (req as any).user?.userId;

  if (!code) {
     res.status(400).json({ message: 'Discount code is required' });
     return;
  }

  try {
    const discount = await prisma.discountCode.findFirst({
      where: {
        code,
        userId,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!discount) {
       res.status(404).json({ message: 'Invalid or expired discount code' });
       return;
    }

    // Optionally mark as used
    await prisma.discountCode.update({
      where: { id: discount.id },
      data: { used: true },
    });

    res.json({ message: 'Discount code redeemed', discount });
  } catch (error) {
    console.error('Error redeeming code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllDiscountCodes = async (_req: Request, res: Response) => {
  try {
    const codes = await prisma.discountCode.findMany({
      include: {
        user: { select: { email: true } },
        cart: { select: { id: true, updatedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(codes);
  } catch (error) {
    console.error('Error fetching all codes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
