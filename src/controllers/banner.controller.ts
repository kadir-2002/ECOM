import { Request, Response } from 'express';
import prisma from '../db/prisma';
import cloudinary from '../upload/cloudinary';
import { Readable } from 'stream';

// Utility to handle Cloudinary stream upload
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    Readable.from(buffer).pipe(stream);
  });
};

export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.homepageBanner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const {
      heading,
      subheading,
      subheading2,
      buttonText,
      buttonLink,
    } = req.body;

    let imageUrl, publicId;

    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, 'banners');
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const banner = await prisma.homepageBanner.create({
      data: {
        heading,
        subheading,
        subheading2,
        buttonText,
        buttonLink,
        imageUrl,
        publicId,
      },
    });

    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create banner' });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const {
      heading,
      subheading,
      subheading2,
      buttonText,
      buttonLink,
    } = req.body;

    const data: any = {
      heading,
      subheading,
      subheading2,
      buttonText,
      buttonLink,
    };

    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, 'banners');
      data.imageUrl = result.secure_url;
      data.publicId = result.public_id;
    }

    const updated = await prisma.homepageBanner.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.homepageBanner.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};
