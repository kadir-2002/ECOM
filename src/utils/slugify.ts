import prisma from './prisma';

type SlugModel = 'category' | 'subcategory' | 'product';


export const generateSlug = async (
  name: string,
  model: SlugModel
): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') 
    .replace(/\s+/g, '-');


  let slug = baseSlug;
  let count = 1;

  while (true) {
    let exists: { slug: string } | null = null;

    switch (model) {
      case 'category':
        exists = await prisma.category.findUnique({
          where: { slug },
          select: { slug: true },
        });
        break;
      case 'subcategory':
        exists = await prisma.subcategory.findUnique({
          where: { slug },
          select: { slug: true },
        });
        break;
      case 'product':
        exists = await prisma.product.findUnique({
          where: { slug },
          select: { slug: true },
        });
        break;
    }
    if (!exists) break;
    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};
