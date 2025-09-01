import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} buffer - Image buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadImageToCloudinary = async (buffer, options = {}) => {
    try {
        return new Promise((resolve, reject) => {
            // Create upload stream
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'journal-entries', // Organize images in folder
                    resource_type: 'image',
                    transformation: [
                        {
                            quality: 'auto:good', // Automatic quality optimization
                            fetch_format: 'auto', // Automatic format selection
                            width: 1200, // Max width for performance
                            height: 1200, // Max height for performance
                            crop: 'limit', // Don't upscale, only downscale if needed
                        }
                    ],
                    ...options
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Convert buffer to stream and pipe to Cloudinary
            const stream = Readable.from(buffer);
            stream.pipe(uploadStream);
        });
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImageFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Image deletion failed: ${error.message}`);
    }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
    const defaultTransformations = {
        quality: 'auto:good',
        fetch_format: 'auto',
        ...transformations
    };

    return cloudinary.url(publicId, defaultTransformations);
};
