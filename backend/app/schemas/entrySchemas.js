import { z } from 'zod';

export const createEntrySchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
    tags: z.array(z.string().max(50)).max(10, 'Too many tags').optional(),
    mood: z.string().max(50).optional(),
    images: z.array(z.object({
        url: z.string().url(),
        publicId: z.string(),
        alt: z.string().optional(),
        uploadedAt: z.string().datetime().optional()
    })).max(5, 'Too many images').optional(),
    date: z.string().datetime().optional()
});

export const updateEntrySchema = z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(10000).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    mood: z.string().max(50).optional(),
    images: z.array(z.object({
        url: z.string().url(),
        publicId: z.string(),
        alt: z.string().optional(),
        uploadedAt: z.string().datetime().optional()
    })).max(5, 'Too many images').optional(),
    date: z.string().datetime().optional()
});

export const getEntriesSchema = z.object({
    mood: z.string().max(50).optional(),
    tag: z.string().max(50).optional(),
    date: z.string().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n <= 100, 'Limit too high').optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional()
}).partial(); // Make all fields optional to handle empty query params
