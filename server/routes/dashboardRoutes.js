import { Router } from 'express';
import { getDashboardSummary, getQuickActions } from '../controllers/dashboardController.js';

const router = Router();

router.get('/summary', getDashboardSummary);
router.get('/quick-actions', getQuickActions);

export default router;
