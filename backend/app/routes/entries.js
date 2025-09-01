import express from 'express';
import {
    createEntry,
    getEntries,
    getEntryById,
    updateEntry,
    deleteEntry,
} from '../controllers/entryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest, validateQuery } from '../middleware/validation.js';
import { createEntrySchema, updateEntrySchema, getEntriesSchema } from '../schemas/entrySchemas.js';

const router = express.Router();

router.use(authenticateToken); // Protect all entry routes

router.post('/', validateRequest(createEntrySchema), createEntry);
router.get('/', getEntries);
router.get('/:id', getEntryById);
router.put('/:id', validateRequest(updateEntrySchema), updateEntry);
router.delete('/:id', deleteEntry);

export default router;
