import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { generateSlug } from '../utils/slugify';
import cloudinary from '../upload/cloudinary';
import { Readable } from 'stream';

// Cloudinary uploader helper
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const {
      sequence_number,
      categryName,
      title,
      heading,
      description,
      seodescription,
      seo_title,
      seo_description,
      seo_keyword,
      parent_catgory,
      minimum_order_quantity,
      isActive,
    } = req.body;

    const slug = await generateSlug(categryName, 'category');

    let image: string | undefined;
    let banner: string | undefined;

    if (req.files && 'image' in req.files) {
      const imageFile = Array.isArray(req.files['image']) ? req.files['image'][0] : req.files['image'];
      if (imageFile?.buffer) {
        const result = await uploadToCloudinary(imageFile.buffer, 'categories/images');
        image = result.secure_url;
      }
    }

    if (req.files && 'banner' in req.files) {
      const bannerFile = Array.isArray(req.files['banner']) ? req.files['banner'][0] : req.files['banner'];
      if (bannerFile?.buffer) {
        const result = await uploadToCloudinary(bannerFile.buffer, 'categories/banners');
        banner = result.secure_url;
      }
    }

    const category = await prisma.category.create({
      data: {
        sequence_number: Number(sequence_number),
        categryName,
        title,
        heading,
        description,
        image,
        banner,
        seodescription,
        seo_title,
        seo_description,
        seo_keyword,
        parent_catgory: parent_catgory ? Number(parent_catgory) : null,
        minimum_order_quantity: minimum_order_quantity ? Number(minimum_order_quantity) : null,
        isActive: isActive === 'true',
      },
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create Category Error:', error);
    res.status(500).json({ message: 'Error creating category', error: (error as Error).message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const {
      sequence_number,
      categryName,
      title,
      heading,
      description,
      seodescription,
      seo_title,
      seo_description,
      seo_keyword,
      parent_catgory,
      minimum_order_quantity,
      isActive,
    } = req.body;

    let image: string | undefined;
    let banner: string | undefined;

    if (req.files && 'image' in req.files) {
      const imageFile = Array.isArray(req.files['image']) ? req.files['image'][0] : req.files['image'];
      if (imageFile?.buffer) {
        const result = await uploadToCloudinary(imageFile.buffer, 'categories/images');
        image = result.secure_url;
      }
    }

    if (req.files && 'banner' in req.files) {
      const bannerFile = Array.isArray(req.files['banner']) ? req.files['banner'][0] : req.files['banner'];
      if (bannerFile?.buffer) {
        const result = await uploadToCloudinary(bannerFile.buffer, 'categories/banners');
        banner = result.secure_url;
      }
    }

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        sequence_number: Number(sequence_number),
        categryName,
        title,
        heading,
        description,
        image,
        banner,
        seodescription,
        seo_title,
        seo_description,
        seo_keyword,
        parent_catgory: parent_catgory ? Number(parent_catgory) : null,
        minimum_order_quantity: minimum_order_quantity ? Number(minimum_order_quantity) : null,
        isActive: isActive === 'true',
      },
    });

    res.json({ message: 'Category updated', category: updated });
  } catch (error) {
    console.error('Update Category Error:', error);
    res.status(500).json({ message: 'Error updating category', error: (error as Error).message });
  }
};

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { sequence_number: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: (error as Error).message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const category = await prisma.category.findFirst({
      where: { slug, isDeleted: false },
    });

    if (!category) {
       res.status(404).json({ message: 'Category not found' });
       return
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: (error as Error).message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({ where: { id: Number(id) } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: (error as Error).message });
  }
};

export const softDeleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { isDeleted: true },
    });

    res.json({ message: 'Category soft deleted', category: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting category', error: (error as Error).message });
  }
};

export const restoreCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const restored = await prisma.category.update({
      where: { id: Number(id) },
      data: { isDeleted: false },
    });

    res.json({ message: 'Category restored', category: restored });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring category', error: (error as Error).message });
  }
};
