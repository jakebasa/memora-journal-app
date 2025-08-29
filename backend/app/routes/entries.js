import express from 'express';
import {
    createEntry,
    getEntries,
    getEntryById,
    updateEntry,
    deleteEntry,
} from '../controllers/entryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // Protect all entry routes

router.post('/', createEntry);
router.get('/', getEntries);
router.get('/:id', getEntryById);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
