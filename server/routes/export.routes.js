import express from 'express';
import { query } from 'express-validator';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  exportExcel,
  exportCSV,
  exportPDF
} from '../controllers/export.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/excel',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validate,
  exportExcel
);

router.get(
  '/csv',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validate,
  exportCSV
);

router.get(
  '/pdf',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validate,
  exportPDF
);

export default router;

