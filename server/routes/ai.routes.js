import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  chatWithAI,
  autoCategorize,
  getSpendingSuggestions
} from '../controllers/ai.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/chat', [body('message').notEmpty()], validate, chatWithAI);
router.post('/categorize', [body('description').notEmpty()], validate, autoCategorize);
router.get('/suggestions', getSpendingSuggestions);

export default router;

