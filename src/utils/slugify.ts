import prisma from '../db/prisma';

export const generateSlug = async (name: string): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters
    .replace(/\s+/g, '-');     // Replace spaces with dashes

  let slug = baseSlug;
  let count = 1;

  while (true) {
    const exists = await prisma.product.findUnique({
      where: { slug },
      select: { slug: true },
    });

    if (!exists) break;

    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};
