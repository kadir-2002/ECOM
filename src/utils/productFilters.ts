type OrderType = 
  | { basePrice: 'asc' | 'desc' }
  | { createdAt: 'asc' | 'desc' };

export function buildProductQuery(query: any) {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = query.search || '';
  const sort = query.sort;

  const categoryId = parseInt(query.category);
  const subcategoryId = parseInt(query.subcategory);
  const minPrice = parseFloat(query.min);
  const maxPrice = parseFloat(query.max);

  const where: any = {
    isDeleted: false,
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { name: { contains: search, mode: 'insensitive' } } },
      { subcategory: { name: { contains: search, mode: 'insensitive' } } },
    ],
  };

  if (!isNaN(categoryId)) where.categoryId = categoryId;
  if (!isNaN(subcategoryId)) where.subcategoryId = subcategoryId;

  if (!isNaN(minPrice) || !isNaN(maxPrice)) {
    where.basePrice = {};
    if (!isNaN(minPrice)) where.basePrice.gte = minPrice;
    if (!isNaN(maxPrice)) where.basePrice.lte = maxPrice;
  }

  let orderBy: OrderType = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
  if (sort === 'price_desc') orderBy = { basePrice: 'desc' };

  return { where, orderBy, skip, limit, page };
}