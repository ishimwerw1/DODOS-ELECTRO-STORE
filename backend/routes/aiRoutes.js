import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';

const router = express.Router();

// @route   POST /api/ai/chat
// @desc    Chat with DODOS ELECTRO AI
// @access  Public
router.post('/chat', chatWithAI);

export default router;
