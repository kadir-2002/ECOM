import { OrderStatus } from '@prisma/client';
import prisma from '../db/prisma';
import { CronJob } from 'cron';
import { sendOrderCancelledEmail } from '../email/canceledOrderMail';
import { sendNotification } from '../utils/notification';


export async function cancelStalePendingOrdersAndNotify() {
  try {
    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find all pending orders older than 48h with user email included
    const staleOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: { lt: cutoffDate },
      },
      include: {
        user: true,
      },
    });

    if (staleOrders.length === 0) {
      console.log('No stale pending orders to cancel.');
      return;
    }

    // Cancel all stale orders at once
    const updateResult = await prisma.order.updateMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: { lt: cutoffDate },
      },
      data: { status: OrderStatus.CANCELLED },
    });

    console.log(`Cancelled ${updateResult.count} stale pending orders.`);

    // Send cancellation email to each affected user
    for (const order of staleOrders) {
      const email = order.user.email;
      if (email) {
        try {
          await sendOrderCancelledEmail(email, order.id);
          sendNotification(order.userId, `⚠️ Order #${order.id} has been cancelled due to inactivity.`, 'ALERT');
          console.log(`Sent cancellation email to ${email} for order #${order.id}`);
        } catch (err) {
          console.error(`Failed to send cancellation email to ${email}`, err);
        }
      }
    }
  } catch (error) {
    console.error('Error cancelling stale pending orders:', error);
  }
}

const job = new CronJob('0 0 * * *', cancelStalePendingOrdersAndNotify);

job.start();
//console.log('Stale pending orders cancellation + email cron job started.');