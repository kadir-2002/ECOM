import { Request, Response } from "express";
import { PaymentStatus } from "@prisma/client";
import prisma from "../db/prisma";

// Create a new payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { method, status, transactionId, paidAt, orderId } = req.body;

    if (!method || !orderId) {
       res.status(400).json({ error: "Method and orderId are required" });
       return;
    }

    const payment = await prisma.payment.create({
      data: {
        method,
        status: status || PaymentStatus.PENDING,
        transactionId,
        paidAt: paidAt ? new Date(paidAt) : null,
        order: { connect: { id: orderId } },
      },
    });
    
    // Link payment to order
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentId: payment.id },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create payment" });
  }
};

// Get payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
       res.status(404).json({ error: "Payment not found" });
       return;
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
};

// Update a payment by ID
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { method, status, transactionId, paidAt } = req.body;

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        method,
        status,
        transactionId,
        paidAt: paidAt ? new Date(paidAt) : null,
      },
    });

    res.json(updatedPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update payment" });
  }
};


// List all payments
export const listPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { order: true },
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

// Get payment details by order ID
export const getPaymentByOrder = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.orderId);

    if (isNaN(orderId)) {
       res.status(400).json({ error: "Invalid orderId" });
       return;
    }

    const payment = await prisma.payment.findFirst({
      where: { order:{ id: orderId} },
      include: { order: true },
    });

    if (!payment) {
       res.status(404).json({ error: "Payment not found for this order" });
       return;
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payment by order ID" });
  }
};
