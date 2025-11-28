import express from 'express';
import { query } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getIncomeVsExpenses,
  getSpendingByCategory,
  getMonthlyTrends,
  getDashboardSummary
} from '../controllers/analytics.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/income-vs-expenses',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validate,
  getIncomeVsExpenses
);

router.get(
  '/spending-by-category',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validate,
  getSpendingByCategory
);

router.get(
  '/monthly-trends',
  [
    query('months').optional().isInt({ min: 1, max: 12 })
  ],
  validate,
  getMonthlyTrends
);

router.get('/dashboard-summary', getDashboardSummary);

export default router;

