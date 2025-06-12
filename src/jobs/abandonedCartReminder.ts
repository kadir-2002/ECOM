import prisma from '../db/prisma';
import { sendAbandonedCartEmail } from '../email/abandonedMail';
import { CronJob } from 'cron';
import crypto from 'crypto';

// Generate a unique 6-character discount code
async function generateUniqueCode(): Promise<string> {
  while (true) {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g., A3F4C1
    const exists = await prisma.discountCode.findUnique({ where: { code } });
    if (!exists) return code;
  }
}

export async function sendAbandonedCartReminders() {
  try {
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        updatedAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
        items: {
          some: {}, // at least one item
        },
        user: {
          isGuest: false,
        },
        reminderCount: { lt: 3 },
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
      const userId = cart.user.id;
      const itemsCount = cart.items.length;

      if (!userEmail || itemsCount === 0) continue;

      // Fetch or create discount code for this cart
      let discountCode = await prisma.discountCode.findFirst({
        where: {
          userId,
          cartId: cart.id,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!discountCode) {
        const newCode = await generateUniqueCode();
        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // valid for 3 days

        discountCode = await prisma.discountCode.create({
          data: {
            code: newCode,
            userId,
            cartId: cart.id,
            discount: 10,
            expiresAt,
          },
        });
      }

      const products = cart.items.map(item => ({
        name: item.product?.name || item.variant?.name || 'Unnamed Product',
        discount: discountCode!.discount,
      }));

      await sendAbandonedCartEmail(userEmail, products, discountCode.code);

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          reminderCount: (cart.reminderCount ?? 0) + 1,
          lastReminderAt: new Date(),
        },
      });

      console.log(`✅ Reminder sent to ${userEmail} with code ${discountCode.code}`);
    }
  } catch (error) {
    console.error('🚨 Abandoned cart reminder job failed:', error);
  }
}

// Run daily at midnight
const job = new CronJob('0 0 * * *', sendAbandonedCartReminders);
job.start();
