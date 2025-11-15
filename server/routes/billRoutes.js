import { Router } from 'express';
import { listBills, createBill, settleShare, sendReminder, deleteBill } from '../controllers/billController.js';

const router = Router();

router.get('/', listBills);
router.post('/', createBill);
router.patch('/:id/settle', settleShare);
router.post('/:id/remind', sendReminder);
router.delete('/:id', deleteBill);

export default router;
