import prisma from '../db/prisma';
import { notifyOrderUpdate } from '../socket/websocket';

export const SendNotification = async (
  userId: number,
  message: string
) => {
  await prisma.notification.create({
    data: {
      userId,
      message,
    },
  });

  notifyOrderUpdate(userId, {
    type: 'NOTIFICATION',
    message,
  });
};
