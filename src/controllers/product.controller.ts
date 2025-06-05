import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { generateSlug } from '../utils/slugify';
import fs from 'fs';
import path from 'path';

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, categoryId, subcategoryId, basePrice } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const slug = await generateSlug(name, 'product');
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        categoryId: parseInt(categoryId),
        subcategoryId: parseInt(subcategoryId),
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// export const getAllProducts = async (_req: Request, res: Response) => {
//   try {
//     // const products = await prisma.product.findMany({
//     //   include: { category: true, subcategory: true, variants: true },
//     // });
//     const products = await prisma.product.findMany({
//       where: { isDeleted: false }, // 👈 Filter out soft-deleted
//       include: { category: true, subcategory: true, variants: true },
//     });
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching products' });
//   }
// };

export const getAllProducts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { isDeleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          subcategory: true,
          variants: {
            include: {
              images: true, 
            },
          },
        },
      }),
      prisma.product.count({
        where: { isDeleted: false },
      }),
    ]);

    res.json({
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching paginated products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  if (!slug) {
     res.status(400).json({ message: 'Missing slug' });
     return;
  }

  try {
    const foundProduct = await prisma.product.findUnique({
      where: { slug, isDeleted: false, },
      include: {
        category: true,
        subcategory: true,
        variants: true,
      },
    });

    if (!foundProduct) {
       res.status(404).json({ message: 'Product not found' });
       return;
    }

    res.json(foundProduct);
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, description, categoryId, subcategoryId, basePrice } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        imageUrl: imageUrl ?? undefined,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        subcategoryId: subcategoryId ? parseInt(subcategoryId) : undefined,
      },
    });
    res.json(updated);
  } catch (error: any) {
    console.error('Update product error:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(500).json({ message: 'Error updating product', details: error.message });
  }
};

// export const deleteProduct = async (req: Request, res: Response) => {
//   const id = parseInt(req.params.id);
//   try {
//     await prisma.product.delete({ where: { id } });
//     res.json({ message: 'Product deleted' });
//   } catch (error: any) {
//     if (error.code === 'P2025') {
//       res.status(404).json({ message: 'Product not found' });
//       return;
//     }
//     res.status(500).json({ message: 'Error deleting product' });
//   }
// };

export const softDeleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const updated = await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Product soft deleted', product: updated });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Product not found' });
    } else {
      console.error('Soft delete product error:', error);
      res.status(500).json({ message: 'Error soft deleting product' });
    }
  }
};

export const restoreProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const restored = await prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });

    res.json({ message: 'Product restored', product: restored });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Product not found' });
    } else {
      console.error('Restore product error:', error);
      res.status(500).json({ message: 'Error restoring product' });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    // Step 1: Fetch product to get image path
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
       res.status(404).json({ message: 'Product not found' });
       return;
    }

    // Step 2: Delete image file from disk if exists
    if (product.imageUrl) {
      const imagePath = path.join(__dirname, '..', 'uploads', path.basename(product.imageUrl));
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn('Failed to delete image file:', err.message);
        }
      });
    }

    // Step 3: Delete from DB
    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product and image deleted' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(500).json({ message: 'Error deleting product' });
    }
  }
};
