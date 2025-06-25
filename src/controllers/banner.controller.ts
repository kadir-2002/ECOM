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
      sequence_number,
      subheading,
      subheading2,
      buttonText,
      buttonLink,
    } = req.body;

    let imageUrl, publicId, mobileBanner;

    if (req.files && 'image' in req.files) {
      const mainFile = Array.isArray(req.files['image'])
        ? req.files['image'][0]
        : req.files['image'];

      if (mainFile?.buffer) {
        const result = await uploadToCloudinary(mainFile.buffer, 'banners');
        imageUrl = result.secure_url;
        publicId = result.public_id;
      }
    }

     // Optional mobile banner image
    if (req.files && 'mobile_banner' in req.files) {
      const mobileFile = Array.isArray(req.files['mobile_banner'])
        ? req.files['mobile_banner'][0]
        : req.files['mobile_banner'];

      if (mobileFile?.buffer) {
        const mobileResult = await uploadToCloudinary(mobileFile.buffer, 'banners/mobile');
        mobileBanner = mobileResult.secure_url;
      }
    }

    const banner = await prisma.homepageBanner.create({
      data: {
        heading,
        sequence_number,
        subheading,
        subheading2,
        buttonText,
        buttonLink,
        imageUrl,
        mobile_banner: mobileBanner,
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
      sequence_number,
      subheading,
      subheading2,
      buttonText,
      buttonLink,
    } = req.body;
    

    const data: any = {
      heading,
      sequence_number,
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

    if (req.files && 'mobile_banner' in req.files) {
      const mobileFile = Array.isArray(req.files['mobile_banner'])
        ? req.files['mobile_banner'][0]
        : req.files['mobile_banner'];

      if (mobileFile?.buffer) {
        const mobileResult = await uploadToCloudinary(mobileFile.buffer, 'banners/mobile');
        data.mobile_banner = mobileResult.secure_url;
      }
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
