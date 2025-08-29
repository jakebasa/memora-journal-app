import express from 'express';
import {
    summarizeEntry,
    getInsights,
    generatePrompt,
    moodAnalysis,
    getTrends,
    chatAssistant,
} from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken); // Protect all AI endpoints

router.post('/summarize', summarizeEntry);
router.post('/insights', getInsights);
router.post('/prompt', generatePrompt);
router.post('/mood', moodAnalysis);
router.get('/trends', getTrends);
router.post('/chat', chatAssistant);

export default router;
