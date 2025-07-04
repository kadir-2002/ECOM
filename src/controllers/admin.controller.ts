import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db/prisma';
import { CustomRequest } from '../middlewares/authenticate';
import fs from 'fs';
import path from 'path';
import { parse } from 'fast-csv';
import { format } from 'fast-csv';
import * as fastcsv from 'fast-csv';
import { generateSlug } from '../utils/slugify';
import cloudinary from '../upload/cloudinary';
import { sendNotification } from '../utils/notification';



interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export const createUserByAdmin = async (req: CustomRequest, res: Response) => {
  const { email, password, profile, role = 'USER' } = req.body;

  if (req.user?.role !== 'ADMIN') {
     res.status(403).json({ message: 'Only admins can create users' });
     return
  }

  let profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
       res.status(400).json({ message: 'User already exists' });
       return
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl: string | null = null;

    if (req.file) {
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'users' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as CloudinaryUploadResult);
          }
        ).end(req.file!.buffer);
      });

      imageUrl = result.secure_url;
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        profile: {
          create: {
            ...profileData,
            imageUrl,
          },
        },
      },
      include: { profile: true },
    });

    res.status(201).json({ message: 'User created by admin', userId: user.id });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserByAdmin = async (req: CustomRequest, res: Response) => {
  const { id } = req.params;
  const { email, role, profile } = req.body;

  let profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: +id },
      include: { profile: true },
    });

    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    let imageUrl = existingUser.profile?.imageUrl;

    if (req.file) {
      // We can't delete old image by publicId since we don't have it, so skip deletion

      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'users' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as CloudinaryUploadResult);
          }
        ).end(req.file!.buffer);
      });

      imageUrl = result.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: +id },
      data: {
        email,
        role,
        profile: {
          update: {
            ...profileData,
            imageUrl,
          },
        },
      },
      include: { profile: true },
    });

    res.status(200).json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


export const resetUserPasswordByAdmin = async (req: CustomRequest, res: Response) => {
  const { userId, newPassword } = req.body;

  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden: Admins only' });
    return;
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    res.status(200).json({ message: 'Password reset by admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUserByAdmin = async (req: CustomRequest, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: +id },
    });

    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    // ✅ Prevent deleting the seeded super admin (by email)
    if (user.email === 'admin@gmail.com') {
       res.status(403).json({ message: 'This user cannot be deleted' });
       return;
    }

    await prisma.profile.deleteMany({ where: { user: { id: +id } } });
    await prisma.user.delete({ where: { id: +id } });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllUsers = async (req: CustomRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ message: 'Access denied: Admins only' });
    return;
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
    });

    // Remove password field from each user object
    const sanitizedUsers = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportUsersToCsv = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        isDeleted: true,
      },
    });

    if (!users || users.length === 0) {
       res.status(404).json({ message: 'No users found' });
       return
    }

    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    users.forEach(user => {
      csvStream.write({
        ...user,
        createdAt: user.createdAt.toISOString(),
      });
    });

    csvStream.end();
  } catch (error) {
    console.error('Export CSV Error:', error);
    res.status(500).json({ message: 'Failed to export users to CSV' });
  }
};


export const exportProductsToCsv = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        basePrice: true,
        variants: true,
        category: true,
        subcategory: true,
        slug: true,
        createdAt: true,
        isDeleted: true,
      },
    });

    if (!products || products.length === 0) {
       res.status(404).json({ message: 'No products found' });
       return
    }

    const flatProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      imageUrl: p.imageUrl,
      basePrice: p.basePrice,
      slug: p.slug,
      createdAt: p.createdAt.toISOString(),
      isDeleted: p.isDeleted,
      variants: JSON.stringify(p.variants),
      category: JSON.stringify(p.category),
      subcategory: JSON.stringify(p.subcategory),
    }));

    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    flatProducts.forEach(product => csvStream.write(product));
    csvStream.end();
  } catch (error) {
    console.error('Export CSV Error:', error);
    res.status(500).json({ message: 'Failed to export products to CSV' });
  }
};

export const exportVariantsToCSV = async (req: Request, res: Response) => {
  try {
    const variants = await prisma.variant.findMany({
      where: { isDeleted: false },
      include: { images: true },
    });

    // Prepare CSV data rows (header + data)
    const rows = [
      ['id', 'productId', 'name', 'price', 'stock', 'images'], // header row
      ...variants.map(v => [
        v.id.toString(),
        v.productId.toString(),
        v.name,
        v.price.toString(),
        v.stock.toString(),
        v.images.map(img => img.url).join(','), // comma separated URLs
      ]),
    ];

    res.setHeader('Content-Disposition', 'attachment; filename="variants.csv"');
    res.setHeader('Content-Type', 'text/csv');

    // Pipe rows to response using fast-csv
    fastcsv
      .write(rows, { headers: false })
      .pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting variants' });
  }
};


export const importProductsFromCSV = async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (!filePath) {
    res.status(400).json({ message: 'CSV file is required' });
    return;
  }

  const results: any[] = [];

  fs.createReadStream(path.resolve(filePath))
    .pipe(parse({ headers: true }))
    .on('error', (error) => {
      console.error(error);
      res.status(500).json({ message: 'Failed to parse CSV file' });
    })
    .on('data', (row) => {
      results.push(row);
    })
    .on('end', async () => {
      try {
        for (const row of results) {
          const { id, name, description, basePrice, variants, category, subcategory } = row;

          if (!name || !basePrice) continue;

          if (id) {
            const existing = await prisma.product.findUnique({
              where: { id: Number(id) }, 
            });

            if (existing) {
              await prisma.product.update({
                where: { id: Number(id) },
                data: {
                  name,
                  description: description || existing.description,
                  basePrice: parseFloat(basePrice),
                  isDeleted: false,
                  variants: variants ? JSON.parse(variants) : undefined,
                  category: category ? { connect: { id: Number(category) } } : undefined,
                  subcategory: subcategory ? { connect: { id: Number(subcategory) } } : undefined,
                },
              });
              continue;
            }
          }

          await prisma.product.create({
            data: {
              name,
              description: description || null,
              basePrice: parseFloat(basePrice),
              slug: await generateSlug(name),
              isDeleted: false,
              variants: variants ? { create: JSON.parse(variants) } : undefined,
              category: category ? { connect: { id: Number(category) } } : undefined,
              subcategory: subcategory ? { connect: { id: Number(subcategory) } } : undefined,
            },
          });
        }

        res.status(201).json({ message: 'Products imported', count: results.length });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving products' });
      }
    });
};


export const importVariantsFromCSV = async (req: Request, res: Response) => {
  const filePath = req.file?.path;

  if (!filePath) {
     res.status(400).json({ message: 'CSV file is required' });
     return;
  }

  const variantsToUpsert: any[] = [];

  fs.createReadStream(path.resolve(filePath))
    .pipe(fastcsv.parse({ headers: true }))
    .on('error', (error) => {
      console.error('CSV parse error:', error);
       res.status(500).json({ message: 'Failed to parse CSV file' });
       return;
    })
    .on('data', (row) => {
      const { variantId, productId, name, price, stock, images } = row;

      // Validate required fields
      if (!productId || !name || !price || !stock) {
        console.warn('Skipping invalid row:', row);
        return;
      }

      // Prepare images create array
      let imagesCreateOrUpdate = undefined;
      if (images) {
        const urls = images
          .split(',')
          .map((url: string) => url.trim())
          .filter(Boolean);

        if (urls.length) {
          imagesCreateOrUpdate = {
            // We'll delete old images when updating (handled in update section)
            create: urls.map((url: string) => ({ url })),
          };
        }
      }

      variantsToUpsert.push({
        id: variantId ? Number(variantId) : undefined,
        productId: Number(productId),
        name,
        price: parseFloat(price),
        stock: Number(stock),
        isDeleted: false,
        images: imagesCreateOrUpdate,
      });
    })
    .on('end', async () => {
      try {
        let processedCount = 0;

        for (const variant of variantsToUpsert) {
          // Check product exists
          const productExists = await prisma.product.findUnique({
            where: { id: variant.productId },
          });

          if (!productExists) {
            console.warn(`Product ID ${variant.productId} not found, skipping variant: ${variant.name}`);
            continue;
          }

          // Try to find existing variant by id first (if provided)
          let existingVariant = null;
          if (variant.id) {
            existingVariant = await prisma.variant.findUnique({
              where: { id: variant.id },
            });
          }

          // If not found by id, try to find by productId + name (to avoid duplicates)
          if (!existingVariant) {
            existingVariant = await prisma.variant.findFirst({
              where: {
                productId: variant.productId,
                name: variant.name,
                isDeleted: false,
              },
            });
          }

          if (existingVariant) {
            // Update variant and replace images (delete old + create new)
            await prisma.variant.update({
              where: { id: existingVariant.id },
              data: {
                price: variant.price,
                stock: variant.stock,
                isDeleted: false,
                images: variant.images
                  ? {
                      deleteMany: {}, // delete all old images
                      create: variant.images.create,
                    }
                  : undefined,
              },
            });
          } else {
            // Create new variant with images (if any)
            await prisma.variant.create({
              data: {
                productId: variant.productId,
                name: variant.name,
                price: variant.price,
                stock: variant.stock,
                isDeleted: false,
                images: variant.images,
              },
            });
          }

          processedCount++;
        }

        res.status(201).json({ message: 'Variants imported/updated', count: processedCount });
      } catch (error) {
        console.error('Error saving variants:', error);
        res.status(500).json({ message: 'Error saving variants' });
      }
    });
};

export const adminBroadcastNotification = async (req: Request, res: Response) => {
  const { message, type = 'SYSTEM' } = req.body;

  if (!message) {
    res.status(400).json({ message: 'Message is required' });
    return;
  }
    
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    select: { id: true },
  });

  await Promise.all(users.map(user => sendNotification(user.id, message, type)));

  res.json({ message: 'Broadcast sent to all users' });
};

export const getUserNotificationsByAdmin = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (!userId) {
    res.status(400).json({ message: 'Invalid userId' });
    return;
  }
    
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ notifications });
};

export const deleteUserNotificationByAdmin = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ message: 'Invalid notification id' });
    return;
  }
    

  await prisma.notification.delete({ where: { id } });

  res.json({ message: 'Notification deleted' });
};