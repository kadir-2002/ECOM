import prisma from '../db/prisma';
import { notifyUpdate } from '../socket/websocket';

type NotificationType = 'ORDER' | 'ALERT' | 'SYSTEM';

export const sendNotification = async (
  userId: number,
  message: string,
  type: NotificationType = 'ORDER' // default type
) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
      type,
    },
  });

  notifyUpdate(userId, {
    type: 'NOTIFICATION',
    data: {
      message,
      type, // ORDER | ALERT | SYSTEM
      id: notification.id,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    },
  });
};
