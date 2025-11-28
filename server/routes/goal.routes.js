import express from 'express';
import { body, param, query } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal
} from '../controllers/goal.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(requireAuth);

const goalValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('targetAmount').isFloat({ min: 0 }).withMessage('Target amount must be positive'),
  body('targetDate').isISO8601().withMessage('Target date must be valid'),
  body('currentAmount').optional().isFloat({ min: 0 })
];

router.get('/', [query('status').optional().isIn(['active', 'completed', 'paused'])], validate, getGoals);
router.get('/:id', [param('id').isMongoId()], validate, getGoal);
router.post('/', goalValidation, validate, createGoal);
router.put('/:id', [param('id').isMongoId(), ...goalValidation], validate, updateGoal);
router.delete('/:id', [param('id').isMongoId()], validate, deleteGoal);

export default router;

