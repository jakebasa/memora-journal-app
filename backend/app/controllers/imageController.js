import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../services/imageUpload.js';

/**
 * Upload single or multiple images
 * POST /api/images/upload
 */
export const uploadImages = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No images provided'
            });
        }

        const uploadPromises = req.files.map(async (file) => {
            try {
                // Upload to Cloudinary
                const result = await uploadImageToCloudinary(file.buffer, {
                    public_id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                });

                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes,
                    originalName: file.originalname
                };
            } catch (error) {
                console.error('Individual upload error:', error);
                throw error;
            }
        });

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises);

        res.status(200).json({
            message: 'Images uploaded successfully',
            images: uploadResults
        });

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({
            error: 'Failed to upload images',
            details: error.message
        });
    }
};

/**
 * Delete image from Cloudinary
 * DELETE /api/images/delete?publicId=...
 */
export const deleteImage = async (req, res) => {
    try {
        const userId = req.user?.id;
        // Get publicId from query parameter
        const publicId = req.query.publicId;
        
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        if (!publicId) {
            return res.status(400).json({
                error: 'Public ID is required'
            });
        }

        // console.log('deleteImage - Received publicId:', publicId);
        // console.log('deleteImage - User ID:', userId);
        
        // Verify the image belongs to the user (basic security check)
        if (!publicId.includes(userId)) {
            return res.status(403).json({
                error: 'Unauthorized to delete this image'
            });
        }

        // Delete from Cloudinary
        const result = await deleteImageFromCloudinary(publicId);

        if (result.result === 'ok') {
            res.status(200).json({
                message: 'Image deleted successfully',
                publicId: publicId
            });
        } else {
            res.status(404).json({
                error: 'Image not found or already deleted'
            });
        }

    } catch (error) {
        console.error('Image deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete image',
            details: error.message
        });
    }
};
