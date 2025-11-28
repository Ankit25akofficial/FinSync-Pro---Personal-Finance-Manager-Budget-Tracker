import express from 'express';
import { body, query, param } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transaction.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Validation rules
const transactionValidation = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Date must be valid ISO format'),
  body('description').optional().isString().trim(),
  body('notes').optional().isString().trim()
];

// All routes require authentication
router.use(requireAuth);

// GET /api/transactions - Get all transactions with filters
router.get(
  '/',
  [
    query('type').optional().isIn(['income', 'expense']),
    query('category').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('search').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  getTransactions
);

// GET /api/transactions/:id - Get single transaction
router.get('/:id', [param('id').isMongoId()], validate, getTransaction);

// POST /api/transactions - Create transaction
router.post('/', transactionValidation, validate, createTransaction);

// PUT /api/transactions/:id - Update transaction
router.put('/:id', [param('id').isMongoId(), ...transactionValidation], validate, updateTransaction);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', [param('id').isMongoId()], validate, deleteTransaction);

export default router;

