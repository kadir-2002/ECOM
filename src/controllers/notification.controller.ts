import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { CustomRequest } from '../middlewares/authenticate';

// 1. Get all notifications
export const getNotifications = async (req: CustomRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(notifications);
};

// 2. Mark one as read
export const markAsRead = async (req: CustomRequest, res: Response) => {
  const { id } = req.params;

  const updated = await prisma.notification.update({
    where: { id: Number(id) },
    data: { isRead: true },
  });

  res.json(updated);
};

// 3. Mark all as read
export const markAllAsRead = async (req: CustomRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true },
  });

  res.json({ message: 'All notifications marked as read.' });
};

// 4. Delete one notification
export const deleteNotification = async (req: CustomRequest, res: Response) => {
  const { id } = req.params;

  await prisma.notification.delete({
    where: { id: Number(id) },
  });

  res.json({ message: 'Notification deleted.' });
};

// 5. Delete all notifications for user
export const clearAllNotifications = async (req: CustomRequest, res: Response) => {
  await prisma.notification.deleteMany({
    where: { userId: req.user!.userId },
  });

  res.json({ message: 'All notifications cleared.' });
};
