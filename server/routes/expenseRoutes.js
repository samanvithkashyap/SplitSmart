import { Router } from 'express';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';

const router = Router();

router.get('/', listExpenses);
router.post('/', createExpense);
router.patch('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
