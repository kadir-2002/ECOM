import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { generateSlug } from '../utils/slugify';

export const createSubcategory = async (req: Request, res: Response) => {
  const { name, categoryId } = req.body;
  if (!name || !categoryId) {
     res.status(400).json({ message: 'Name and categoryId are required' });
     return;
  }

  try {
    const slug = await generateSlug(name, 'category');
    const subcategory = await prisma.subcategory.create({
      data: {
        name,
        slug,
        categoryId: parseInt(categoryId),
      },
    });
    res.status(201).json(subcategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subcategory' });
  }
};

export const getAllSubcategories = async (_req: Request, res: Response) => {
  try {
    // const subcategories = await prisma.subcategory.findMany({
    //   include: { category: true, products: true },
    // });
    const subcategories = await prisma.subcategory.findMany({
      where: { isDeleted: false },
      include: { category: true, products: true },
    });
    res.json(subcategories);
  } catch {
    res.status(500).json({ message: 'Error fetching subcategories' });
  }
};

export const getSubcategoryBySlug = async (req: Request, res: Response) => {
  const slug = req.params.slug;
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { slug },
      include: { category: true, products: true },
    });
    if (!subcategory) {
        res.status(404).json({ message: 'Subcategory not found' });
        return;
    }
    res.json(subcategory);
  } catch {
    res.status(500).json({ message: 'Error fetching subcategory' });
  }
};

export const updateSubcategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, categoryId } = req.body;

  try {
    const updated = await prisma.subcategory.update({
      where: { id },
      data: {
        name,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
      },
    });
    res.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
       res.status(404).json({ message: 'Subcategory not found' });
       return;
    }
    res.status(500).json({ message: 'Error updating subcategory' });
  }
};

export const deleteSubcategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.subcategory.delete({ where: { id } });
    res.json({ message: 'Subcategory deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
       res.status(404).json({ message: 'Subcategory not found' });
       return;
    }
    res.status(500).json({ message: 'Error deleting subcategory' });
  }
};

export const softDeleteSubcategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: { isDeleted: true },
    });
    res.json({ message: 'Subcategory soft deleted', subcategory });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Subcategory not found' });
    } else {
      res.status(500).json({ message: 'Error soft deleting subcategory' });
    }
  }
};

export const restoreSubcategory = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  try {
    const restored = await prisma.subcategory.update({
      where: { id },
      data: { isDeleted: false },
    });
    res.json({ message: 'Subcategory restored', subcategory: restored });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Subcategory not found' });
    } else {
      res.status(500).json({ message: 'Error restoring subcategory' });
    }
  }
};
