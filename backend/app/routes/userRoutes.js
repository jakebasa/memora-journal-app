import express from 'express';
import { getUserTheme, updateUserTheme, getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * Theme management routes
 */
router.get('/theme', getUserTheme);
router.put('/theme', updateUserTheme);

/**
 * User profile route
 */
router.get('/profile', getUserProfile);

export default router;
