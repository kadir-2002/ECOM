import prisma from '../utils/prisma';
import { sendAbandonedCartEmail } from '../utils/abandonedMail';
import { CronJob } from 'cron';

export async function sendAbandonedCartReminders() {
  try {
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
        items: {
          some: {},  // carts with at least one item
        },
        user: {
            isGuest: {
                not: true, // 🛑 exclude guest users
            },
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    for (const cart of abandonedCarts) {
      const userEmail = cart.user.email;
      const itemsCount = cart.items.length;

      // Only send if less than 3 reminders sent
      if (!userEmail || itemsCount === 0 || (cart.reminderCount ?? 0) >= 3) continue;

      const discountPerItem = 10;
      const products = cart.items.map(item => ({
        name: item.product?.name ?? item.variant?.id ?? 'Unknown Product',
        discount: discountPerItem,
      }));

      await sendAbandonedCartEmail(userEmail, products);

      // Update reminder count and last reminder timestamp
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          reminderCount: (cart.reminderCount ?? 0) + 1,
          lastReminderAt: new Date(),
        },
      });

      console.log(`Sent abandoned cart reminder to ${userEmail}`);
    }
  } catch (error) {
    console.error('Failed to send abandoned cart reminders:', error);
  }
}

const job = new CronJob('0 0 * * *', sendAbandonedCartReminders);

job.start();

console.log('Abandoned cart reminder cron job started.');