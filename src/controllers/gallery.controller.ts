import { Request, Response } from 'express';
import prisma from '../db/prisma';
import cloudinary from '../upload/cloudinary';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const createGalleryItem = async (req: Request, res: Response) => {
  const { title, description, category } = req.body;

  try {
    if (!req.file) {
       res.status(400).json({ message: 'Image is required' });
       return;
    }

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'gallery' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result as CloudinaryUploadResult);
        }
      );
      uploadStream.end(req.file?.buffer);
    });

    const galleryItem = await prisma.galleryItem.create({
      data: {
        title,
        description,
        category,
        imageUrl: result.secure_url,
        publicId: result.public_id,
      },
    });

    res.status(201).json(galleryItem);
  } catch (error) {
    console.error('Create Gallery Error:', error);
    res.status(500).json({ message: 'Failed to create gallery item' });
  }
};

export const getAllGalleryItems = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch gallery items' });
  }
};

export const deleteGalleryItem = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const existing = await prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }

    await cloudinary.uploader.destroy(existing.publicId);
    await prisma.galleryItem.delete({ where: { id } });

    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item' });
  }
};
