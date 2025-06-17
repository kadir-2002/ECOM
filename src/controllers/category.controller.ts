import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { generateSlug } from '../utils/slugify';
import cloudinary from '../upload/cloudinary';


export const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    const slug = await generateSlug(name, 'category');

    let imageUrl: string | undefined = undefined;
    let publicId: string | undefined = undefined;

    if (req.file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'categories' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file?.buffer);
      });

      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const category = await prisma.category.create({
      data: { name, slug, imageUrl, publicId },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating category' });
  }
};


export const getAllCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    include: { subcategories: true },
  });
  res.json(categories);
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug, isDeleted:false },
      include: { subcategories: true },
    });

    if (!category) {
       res.status(404).json({ message: 'Category not found' });
       return;
    }

    res.json(category);
  } catch (error) {
    console.error('Error retrieving category by slug:', error);
    res.status(500).json({ message: 'Error retrieving category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const data: any = { name };

    if (req.file) {
      const result = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'categories' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file?.buffer);
      });

      data.imageUrl = result.secure_url;
      data.publicId = result.public_id;
    }

    const updated = await prisma.category.update({
      where: { id: +id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {

  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: +id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};

export const softDeleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await prisma.category.update({
      where: { id: +id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Category soft deleted', category: updated });
  } catch (error) {
    console.error('Soft delete error:', error);
    res.status(500).json({ message: 'Error soft deleting category' });
  }
};

export const restoreCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const restored = await prisma.category.update({
      where: { id: +id },
      data: { isDeleted: false },
    });

    res.json({ message: 'Category restored', category: restored });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ message: 'Error restoring category' });
  }
};
