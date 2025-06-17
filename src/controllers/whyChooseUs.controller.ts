import { Request, Response } from 'express';
import prisma from '../db/prisma';
import cloudinary from '../upload/cloudinary';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const createWhyChooseUsItem = async (req: Request, res: Response) => {
  const { mainTitle, title, subtitle, description, order } = req.body;

  if (!title || !subtitle || !description) {
     res.status(400).json({ message: 'Title, subtitle, and description are required.' });
     return;
  }

  try {
    let iconUrl: string | undefined;
    let publicId: string | undefined;

    if (req.file) {
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'whyChooseUsIcons' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as CloudinaryUploadResult);
          }
        );
        uploadStream.end(req.file?.buffer);
      });

      iconUrl = result.secure_url;
      publicId = result.public_id;
    }

    const newItem = await prisma.whyChooseUsItem.create({
      data: {
        mainTitle,
        title,
        subtitle,
        description,
        iconUrl,
        // Optionally save publicId if you want to manage/delete images later
        order: order ? parseInt(order) : 0,
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create WhyChooseUsItem error:', error);
    res.status(500).json({ message: 'Error creating item' });
  }
};

// Similarly, update function for handling image replacement

export const updateWhyChooseUsItem = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { mainTitle, title, subtitle, description, order } = req.body;

  try {
    const existing = await prisma.whyChooseUsItem.findUnique({ where: { id } });
    if (!existing) {
       res.status(404).json({ message: 'Item not found' });
       return;
    }

    let iconUrl = existing.iconUrl;
    // You might want to store publicId in model for deleting old images
    // let publicId = existing.publicId;

    if (req.file) {
      // Delete old image on Cloudinary if you store publicId (optional)
      // if (publicId) {
      //   await cloudinary.uploader.destroy(publicId).catch(console.error);
      // }

      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'whyChooseUsIcons' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as CloudinaryUploadResult);
          }
        );
        uploadStream.end(req.file?.buffer);
      });

      iconUrl = result.secure_url;
      // publicId = result.public_id; // If you want to save it
    }

    const updated = await prisma.whyChooseUsItem.update({
      where: { id },
      data: {
        mainTitle,
        title,
        subtitle,
        description,
        iconUrl,
        order: order ? parseInt(order) : existing.order,
        // publicId, // save if you added this to model
      },
    });

    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
       res.status(404).json({ message: 'Item not found' });
       return;
    }
    console.error('Update WhyChooseUsItem error:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
};

export const getAllWhyChooseUsItems = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.whyChooseUsItem.findMany({
      orderBy: { order: 'asc' }, // optional sorting by order field
    });
    res.json(items);
  } catch (error) {
    console.error('Get all WhyChooseUs items error:', error);
    res.status(500).json({ message: 'Error fetching items' });
  }
};

// Get single item by id
export const getWhyChooseUsItemById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const item = await prisma.whyChooseUsItem.findUnique({
      where: { id },
    });

    if (!item) {
       res.status(404).json({ message: 'Item not found' });
       return;
    }

    res.json(item);
  } catch (error) {
    console.error('Get WhyChooseUs item by id error:', error);
    res.status(500).json({ message: 'Error fetching item' });
  }
};

// Delete an item by id (optionally also delete image on Cloudinary if you save publicId)
export const deleteWhyChooseUsItem = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const item = await prisma.whyChooseUsItem.findUnique({ where: { id } });

    if (!item) {
       res.status(404).json({ message: 'Item not found' });
         return;
    }

    // If you stored publicId for icon image and want to delete it from Cloudinary:
    // if (item.publicId) {
    //   await cloudinary.uploader.destroy(item.publicId).catch(console.error);
    // }

    await prisma.whyChooseUsItem.delete({ where: { id } });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete WhyChooseUs item error:', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
};
