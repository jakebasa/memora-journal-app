import Entry from '../models/Entry.js';
import { createEntrySchema, updateEntrySchema } from '../schemas/entrySchemas.js';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createEntry = async (req, res) => {
    try {
        const { title, content, tags, mood, date, images } = req.body;
        // console.log('createEntry - Received images:', images);
        
        // Sanitize inputs
        const sanitizedData = {
            userId: req.user.id,
            title: sanitizeInput.text(title),
            content: sanitizeInput.html(content),
            tags: sanitizeInput.stringArray(tags),
            mood: sanitizeInput.text(mood),
            images: images || [],
            date: date ? new Date(date) : new Date(),
        };
        
        const entry = await Entry.create(sanitizedData);
        // console.log('createEntry - Created entry with images:', entry.images);
        res.status(201).json({ success: true, data: entry });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: err.message || 'Failed to create entry'
        });
    }
};

// controllers/entryController.js
export const getEntries = async (req, res) => {
    try {
        const filter = { userId: req.user.id };
        // Remove unused pagination variables since we're not using them
        // const limit = parseInt(req.query.limit) || 1000;
        // const offset = parseInt(req.query.offset) || 0;

        if (req.query.mood) filter.mood = req.query.mood;
        if (req.query.tag) filter.tags = req.query.tag;

        if (req.query.date) {
            const day = new Date(req.query.date);
            const startOfDay = new Date(day.setHours(0, 0, 0, 0));
            const endOfDay = new Date(day.setHours(23, 59, 59, 999));

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const entryList = await Entry.find(filter)
            .sort({ date: -1 });
        
        // Debug log removed - API working correctly
        
        // Always return entries array for consistency
        res.status(200).json(entryList);
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: err.message || 'Failed to fetch entries'
        });
    }
};

export const getEntryById = async (req, res) => {
    try {
        const entry = await Entry.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        // console.log('getEntryById - Fetched entry with images:', entry.images);
        res.status(200).json(entry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateEntry = async (req, res) => {
    try {
        const { title, content, tags, mood, images } = req.body;
        
        const updateData = {
            title: sanitizeInput.text(title),
            content: sanitizeInput.html(content),
            tags: sanitizeInput.stringArray(tags),
            mood: sanitizeInput.text(mood),
            images: images || [],
            updatedAt: new Date(),
        };
        
        const entry = await Entry.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            updateData,
            { new: true }
        );
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        res.status(200).json(entry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteEntry = async (req, res) => {
    try {
        // First find the entry to get image data before deletion
        const entry = await Entry.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });
        if (!entry) return res.status(404).json({ message: 'Entry not found' });

        // Delete images from Cloudinary if they exist
        if (entry.images && entry.images.length > 0) {
            const { deleteImageFromCloudinary } = await import('../services/imageUpload.js');
            
            // Delete each image from Cloudinary
            const deletePromises = entry.images.map(async (image) => {
                try {
                    await deleteImageFromCloudinary(image.publicId);
                } catch (error) {
                    // Log error but continue with other deletions
                    if (process.env.NODE_ENV === 'development') {
                        console.error(`Failed to delete image ${image.publicId} from Cloudinary:`, error);
                    }
                    // Continue with other deletions even if one fails
                }
            });
            
            await Promise.allSettled(deletePromises);
        }

        // Now delete the entry from database
        await Entry.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });
        
        res.status(200).json({ message: 'Entry and associated images deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
