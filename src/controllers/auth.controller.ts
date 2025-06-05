import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import prisma from '../utils/prisma';

export const register = async (req: Request, res: Response) => {
  const { email, password, profile } = req.body;
  // console.log('req.body:', req.body);  // Debug line
  // console.log('req.file:', req.file);  // Debug line

  let profileData = profile;
  if (typeof profile === 'string') {
    profileData = JSON.parse(profile);
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'USER', // 🚫 Don't take from input — enforce USER
        profile: {
          create: {
            ...profileData,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
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

// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     const user = await prisma.user.findUnique({
//       where: { email },
//       include: { profile: true },
//     });

//     if (!user) {
//       res.status(400).json({ message: 'Invalid credentials' });
//       return;
//     }

//     const isValid = await bcrypt.compare(password, user.password);
//     if (!isValid) {
//       res.status(400).json({ message: 'Invalid credentials' });
//       return;
//     }

//     const token = generateToken({ userId: user.id, role: user.role });

//     res.status(200).json({
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         firstName: user.profile?.firstName ?? null,
//         lastName: user.profile?.lastName ?? null,
//         imageUrl: user.profile?.imageUrl ?? null,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }

    // If user is soft deleted (deactivated), reactivate automatically
    if (user.isDeleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isDeleted: false },
      });
      user.isDeleted = false; // update local object so returned info is consistent
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
// for instagram like feature, user can deactivate account and relogin 
