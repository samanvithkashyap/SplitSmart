import { Router } from 'express';
import { listNotifications, markNotificationRead, createTestNotification } from '../controllers/notificationController.js';

const router = Router();

router.get('/', listNotifications);
router.patch('/:id/read', markNotificationRead);
router.post('/test', createTestNotification);

export default router;
