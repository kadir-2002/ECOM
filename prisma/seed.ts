// prisma/seed.ts
import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASS;

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASS in environment variables');
  }

  const superAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!superAdmin) {
    await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user seeded');
  } else {
    console.log('ℹ️ Admin user already exists');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
