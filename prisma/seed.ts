// prisma/seed.ts
import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const superAdmin = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' },
  });

  if (!superAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
      },
    });

    console.log('Admin user seeded');
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
