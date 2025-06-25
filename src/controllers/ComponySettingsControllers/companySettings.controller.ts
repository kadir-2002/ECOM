import { Request, Response } from 'express';
import prisma from '../../db/prisma';


// 🔹 Create new company settings
export const createCompanySettings = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const settings = await prisma.companySettings.create({ data });

    res.status(201).json({ message: 'Company settings created', settings });
  } catch (error) {
    console.error('Error creating company settings:', error);
    res.status(500).json({
      message: 'Failed to create company settings',
      details: (error as Error).message,
    });
  }
};

// 🔹 Get all company settings (you likely only have one)
export const getAllCompanySettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.companySettings.findMany();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve settings', details: (error as Error).message });
  }
};

// 🔹 Get settings by ID
export const getCompanySettingsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const settings = await prisma.companySettings.findUnique({ where: { id } });

    if (!settings) {
       res.status(404).json({ message: 'Settings not found' });
       return;
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve settings', details: (error as Error).message });
  }
};

// 🔹 Update settings by ID
export const updateCompanySettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updated = await prisma.companySettings.update({
      where: { id },
      data,
    });

    res.status(200).json({ message: 'Settings updated successfully', updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', details: (error as Error).message });
  }
};

// 🔹 Delete settings by ID
export const deleteCompanySettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.companySettings.delete({ where: { id } });

    res.status(200).json({ message: 'Settings deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete settings', details: (error as Error).message });
  }
};
