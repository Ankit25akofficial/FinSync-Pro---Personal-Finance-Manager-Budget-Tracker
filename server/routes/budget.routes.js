import express from 'express';
import { body, param, query } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget
} from '../controllers/budget.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(requireAuth);

const budgetValidation = [
  body('category').notEmpty().withMessage('Category is required'),
  body('monthlyLimit').isFloat({ min: 0 }).withMessage('Monthly limit must be a positive number'),
  body('month').optional().isInt({ min: 1, max: 12 }),
  body('year').optional().isInt({ min: 2020 })
];

router.get(
  '/',
  [
    query('month').optional().isInt({ min: 1, max: 12 }),
    query('year').optional().isInt({ min: 2020 })
  ],
  validate,
  getBudgets
);

router.get('/:id', [param('id').isMongoId()], validate, getBudget);
router.post('/', budgetValidation, validate, createBudget);
router.put('/:id', [param('id').isMongoId(), ...budgetValidation], validate, updateBudget);
router.delete('/:id', [param('id').isMongoId()], validate, deleteBudget);

export default router;

