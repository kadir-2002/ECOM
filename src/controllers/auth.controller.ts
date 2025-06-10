import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import prisma from '../utils/prisma';
import cloudinary from '../utils/cloudinary';

export const register = async (req: Request, res: Response) => {
  const { email, password, profile } = req.body;

  let profileData = profile;
  if (typeof profile === 'string') {
    try {
      profileData = JSON.parse(profile);
    } catch (err) {
       res.status(400).json({ message: 'Invalid profile format' });
       return;
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
       res.status(400).json({ message: 'User already exists' });
       return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl: string | null = null;
    // let publicId: string | null = null;

    if (req.file) {
      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'users' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      imageUrl = result.secure_url;
      // publicId = result.public_id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER',
        profile: {
          create: {
            ...profileData,
            imageUrl,
            // publicId,
          },
        },
      },
      include: { profile: true },
    });

    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.password) {
       res.status(400).json({ message: 'Invalid credentials' });
       return
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
       res.status(400).json({ message: 'Invalid credentials' });
       return
    }

    if (user.isDeleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isDeleted: false },
      });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
        imageUrl: user.profile?.imageUrl ?? null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
