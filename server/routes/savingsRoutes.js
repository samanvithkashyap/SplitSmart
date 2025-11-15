import { Router } from 'express';
import { listGoals, createGoal, updateGoal, addProgress, deleteGoal } from '../controllers/savingsController.js';

const router = Router();

router.get('/', listGoals);
router.post('/', createGoal);
router.patch('/:id', updateGoal);
router.post('/:id/progress', addProgress);
router.delete('/:id', deleteGoal);

export default router;
