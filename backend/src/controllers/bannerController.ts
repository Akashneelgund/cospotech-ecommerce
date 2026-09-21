import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    res.json({ success: true, announcements });
  } catch (error: any) {
    console.error('getAnnouncements error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
  }
};

export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const placement = req.query.placement ? String(req.query.placement) : undefined;
    const where: any = { isActive: true };
    if (placement) where.placement = placement;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { displayOrder: 'asc' }
    });
    res.json({ success: true, banners });
  } catch (error: any) {
    console.error('getBanners error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
  }
};

export const createBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, subtitle, badge, imageUrl, ctaText, ctaLink, placement, displayOrder } = req.body;
    if (!title || !imageUrl) {
      res.status(400).json({ success: false, message: 'Title and image URL are required.' });
      return;
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle: subtitle || null,
        badge: badge || null,
        imageUrl,
        ctaText: ctaText || 'Shop Collection',
        ctaLink: ctaLink || '/shop',
        placement: placement || 'HERO',
        displayOrder: Number(displayOrder) || 0
      }
    });

    res.status(201).json({ success: true, banner });
  } catch (error: any) {
    console.error('createBanner error:', error);
    res.status(500).json({ success: false, message: 'Failed to create banner.' });
  }
};

export const updateBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { title, subtitle, badge, imageUrl, ctaText, ctaLink, placement, isActive, displayOrder } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(badge !== undefined && { badge }),
        ...(imageUrl && { imageUrl }),
        ...(ctaText && { ctaText }),
        ...(ctaLink && { ctaLink }),
        ...(placement && { placement }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) })
      }
    });

    res.json({ success: true, banner });
  } catch (error: any) {
    console.error('updateBanner error:', error);
    res.status(500).json({ success: false, message: 'Failed to update banner.' });
  }
};

export const deleteBanner = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.banner.delete({ where: { id } });
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (error: any) {
    console.error('deleteBanner error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete banner.' });
  }
};

export const createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { text, link, displayOrder, isActive } = req.body;
    if (!text) {
      res.status(400).json({ success: false, message: 'Announcement text is required.' });
      return;
    }
    const announcement = await prisma.announcement.create({
      data: {
        text,
        link: link || null,
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });
    res.status(201).json({ success: true, announcement });
  } catch (error: any) {
    console.error('createAnnouncement error:', error);
    res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
};

export const updateAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { text, link, displayOrder, isActive } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(text && { text }),
        ...(link !== undefined && { link }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });
    res.json({ success: true, announcement });
  } catch (error: any) {
    console.error('updateAnnouncement error:', error);
    res.status(500).json({ success: false, message: 'Failed to update announcement.' });
  }
};

export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.announcement.delete({ where: { id } });
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (error: any) {
    console.error('deleteAnnouncement error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
};
