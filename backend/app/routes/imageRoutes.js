import express from 'express';
import { uploadImages, deleteImage } from '../controllers/imageController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Upload images (supports multiple files)
// POST /api/images/upload
router.post('/upload', 
    authenticateToken, 
    upload.array('images', 5), // Accept up to 5 images with field name 'images'
    uploadImages
);

// Delete image by public ID (using query parameter to avoid path issues)
// DELETE /api/images/delete?publicId=...
router.delete('/delete', 
    authenticateToken, 
    deleteImage
);

export default router;
