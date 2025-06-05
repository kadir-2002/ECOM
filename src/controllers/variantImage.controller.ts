import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';

export const createVariantImage = async (req: Request, res: Response) => {
  const variantId = +req.body.variantId;

  if (!variantId || isNaN(variantId)) {
     res.status(400).json({ message: 'Invalid or missing variantId' });
     return;
  }

  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
     res.status(400).json({ message: 'At least one image is required' });
     return;
  }

  try {
    const images = await prisma.variantImage.createMany({
      data: files.map((file) => ({
        url: `/uploads/${file.filename}`,
        variantId,
      })),
    });

    res.status(201).json({ message: 'Images uploaded successfully', count: images.count });
  } catch (err) {
    console.error('Error creating variant images:', err);
    res.status(500).json({ message: 'Failed to upload images' });
  }
};


export const getAllVariantImages = async (req: Request, res: Response) => {
  const variantId = req.query.variantId ? +req.query.variantId : undefined;

  try {
    const images = await prisma.variantImage.findMany({
      where: variantId ? { variantId } : undefined,
      include: { variant: true },
    });
    res.json(images);
  } catch (err) {
    console.error('Error fetching variant images:', err);
    res.status(500).json({ message: 'Failed to fetch variant images' });
  }
};

export const getVariantImageById = async (req: Request, res: Response) => {
  const id = +req.params.variantId;

  try {
    const image = await prisma.variantImage.findUnique({
      where: { id },
      include: { variant: true },
    });

    if (!image) {
       res.status(404).json({ message: 'Image not found' });
       return;
    }

    res.json(image);
  } catch (err) {
    console.error('Error fetching variant image:', err);
    res.status(500).json({ message: 'Failed to fetch variant image' });
  }
};

export const updateVariantImage = async (req: Request, res: Response) => {
  const id = +req.params.id;
  const variantId = req.body.variantId ? +req.body.variantId : undefined;

  try {
    const updated = await prisma.variantImage.update({
      where: { id },
      data: {
        url: req.file ? `/uploads/${req.file.filename}` : undefined,
        ...(variantId ? { variantId } : {}),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating image:', err);
    res.status(500).json({ message: 'Failed to update image' });
  }
};

export const deleteVariantImage = async (req: Request, res: Response) => {
  const id = +req.params.id;

  try {
    const image = await prisma.variantImage.findUnique({ where: { id } });

    if (!image) {
       res.status(404).json({ message: 'Image not found' });
       return;
    }

    const imagePath = path.join(__dirname, '..', '..', 'uploads', path.basename(image.url || ''));
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.warn('File not found or failed to delete:', err.message);
      }
    });

    await prisma.variantImage.delete({ where: { id } });
    res.json({ message: 'Variant image deleted successfully' });
  } catch (err) {
    console.error('Error deleting variant image:', err);
    res.status(500).json({ message: 'Failed to delete variant image' });
  }
};
