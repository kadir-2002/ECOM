import { Request, Response } from 'express';
import prisma from '../db/prisma';
import bcrypt from 'bcryptjs';
import { CustomRequest } from '../auth/jwt';
import cloudinary from '../upload/cloudinary'; // Cloudinary client config

// Helper to delete Cloudinary image by public ID
const deleteCloudinaryImage = async (imageUrl: string) => {
  try {
    // Extract public ID from URL, e.g.:
    // https://res.cloudinary.com/demo/image/upload/v1234567890/folder/file.jpg
    // public ID = "folder/file"
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1]; // "file.jpg"
    const folder = urlParts[urlParts.length - 2]; // "folder" (if used)
    const publicId = `${folder}/${lastPart.split('.')[0]}`; // remove extension

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Failed to delete Cloudinary image:', err);
  }
};

export const deleteOwnAccount = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (user?.profile?.imageUrl) {
      await deleteCloudinaryImage(user.profile.imageUrl);
    }

    if (user?.profileId) {
      await prisma.profile.delete({ where: { id: user.profileId } });
    }
    await prisma.cart.deleteMany({ where: { userId: userId } });
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'Your account has been deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

interface JwtPayload {
  userId: number;
  role: 'USER' | 'ADMIN';
}
export interface UpdateRequest extends Request {
  user?: JwtPayload;
  file?: Express.Multer.File;
}

export const updateOwnProfile = async (req: UpdateRequest, res: Response) => {
  const userId = req.user?.userId;
  const { firstName, lastName, bio } = req.body;

  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      include: { profile: true },
    });

    if (!user?.profile || !user.profileId) {
       res.status(404).json({ message: 'Profile not found' });
       return
    }

    const profileUpdateData: any = { firstName, lastName, bio };

    if (req.file) {
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'profile_images' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as { secure_url: string });
          }
        );
        stream.end(req.file!.buffer); // `!` is safe here due to `if (req.file)`
      });

      profileUpdateData.imageUrl = uploadResult.secure_url;
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: user.profileId },
      data: profileUpdateData,
    });

    res.json({ message: 'Your profile updated', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const changePassword = async (req: CustomRequest, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body;

  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    if (!user.password) {
       res.status(400).json({ message: 'Password not set for this user' });
       return;
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
       res.status(400).json({ message: 'Old password is incorrect' });
       return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req: CustomRequest, res: Response) => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user.userId, isDeleted: false },
      include: { profile: true },
    });

    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      bio: user.profile?.bio ?? null,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      imageUrl: user.profile?.imageUrl ?? null,
    });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const softDeleteOwnAccount = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    res.json({ message: 'Your account has been soft deleted' });
  } catch (error) {
    console.error('Error soft deleting account:', error);
    res.status(500).json({ message: 'Failed to soft delete account' });
  }
};

export const restoreOwnAccount = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  try {
    const restoredUser = await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: false },
    });

    res.json({ message: 'Your account has been restored', user: restoredUser });
  } catch (error) {
    console.error('Error restoring account:', error);
    res.status(500).json({ message: 'Failed to restore account' });
  }
};
