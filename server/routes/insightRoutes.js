import { Router } from 'express';
import { getOverview, getRecommendations, recalculateInsights } from '../controllers/insightController.js';

const router = Router();

router.get('/overview', getOverview);
router.get('/recommendations', getRecommendations);
router.post('/recalculate', recalculateInsights);

export default router;
