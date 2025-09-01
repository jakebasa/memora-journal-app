import multer from 'multer';
import path from 'path';

// File filter for image validation
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'), false);
    }
};

// Configure multer for memory storage (files stored in memory as Buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5, // Maximum 5 files per upload
    },
    fileFilter: fileFilter,
});

export default upload;
