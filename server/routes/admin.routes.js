import express from 'express';
import { param, query, body } from 'express-validator';
import { requireAdmin } from '../middleware/auth.middleware.js';
import {
  getAllUsers,
  getFraudAlerts,
  updateFraudAlert,
  getSystemStats
} from '../controllers/admin.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(requireAdmin);

router.get('/users', getAllUsers);
router.get('/fraud-alerts', [
  query('status').optional().isIn(['pending', 'reviewed', 'resolved', 'false_positive'])
], validate, getFraudAlerts);
router.put('/fraud-alerts/:id', [
  param('id').isMongoId(),
  body('status').isIn(['pending', 'reviewed', 'resolved', 'false_positive'])
], validate, updateFraudAlert);
router.get('/stats', getSystemStats);

export default router;

