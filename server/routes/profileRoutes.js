import { Router } from 'express';
import { getProfile, updateProfile, changePassword, getActivity } from '../controllers/profileController.js';

const router = Router();

router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/password', changePassword);
router.get('/activity', getActivity);

export default router;
