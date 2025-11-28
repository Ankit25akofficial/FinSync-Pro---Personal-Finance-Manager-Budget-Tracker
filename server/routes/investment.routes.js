import express from 'express';
import { body, param, query } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getInvestments,
  getInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment
} from '../controllers/investment.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(requireAuth);

const investmentValidation = [
  body('type').isIn(['Stock', 'Mutual Fund', 'SIP', 'Crypto', 'FD', 'Other']).withMessage('Invalid investment type'),
  body('name').notEmpty().withMessage('Name is required'),
  body('investedAmount').isFloat({ min: 0 }).withMessage('Invested amount must be positive'),
  body('purchaseDate').isISO8601().withMessage('Purchase date must be valid'),
  body('purchasePrice').isFloat({ min: 0 }).withMessage('Purchase price must be positive')
];

router.get('/', [query('type').optional().isString()], validate, getInvestments);
router.get('/:id', [param('id').isMongoId()], validate, getInvestment);
router.post('/', investmentValidation, validate, createInvestment);
router.put('/:id', [param('id').isMongoId(), ...investmentValidation], validate, updateInvestment);
router.delete('/:id', [param('id').isMongoId()], validate, deleteInvestment);

export default router;

