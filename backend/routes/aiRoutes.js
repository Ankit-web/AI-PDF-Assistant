import express from 'express';
import aiController from '../controllers/aiController.js';
import { isLoggedIn } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/ai/summarize/:documentId
 * @desc    Generates a summary for a specific document (on-demand)
 * @access  Private
 */
router.post(
  '/summarize/:documentId',
  isLoggedIn,
  aiController.summarizeDocument
);

/**
 * @route   POST /api/ai/chat/:documentId
 * @desc    Chat with a specific document
 * @access  Private
 */
router.post(
    '/chat/:documentId', 
    isLoggedIn, 
    aiController.chat
);

export default router;


