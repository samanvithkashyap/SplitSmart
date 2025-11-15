import { Router } from 'express';
import { listTransactions, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';

const router = Router();

router.get('/', listTransactions);
router.patch('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
