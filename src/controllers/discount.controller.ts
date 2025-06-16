import { Request, Response } from 'express';
import prisma from '../db/prisma';

export const createDiscountRule = async (req: Request, res: Response) => {
  const { percentage, minItems } = req.body;

  if (!percentage || !minItems) {
     res.status(400).json({ message: 'percentage and minItems are required' });
     return;
  }

  try {
    const rule = await prisma.discountRule.create({
      data: { percentage, minItems },
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error creating discount rule:', error);
    res.status(500).json({ message: 'Failed to create discount rule' });
  }
};

// GET - accessible by any user
export const getDiscountRules = async (req: Request, res: Response) => {
  try {
    const rules = await prisma.discountRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(rules);
  } catch (error) {
    console.error('Error fetching discount rules:', error);
    res.status(500).json({ message: 'Failed to fetch discount rules' });
  }
};
