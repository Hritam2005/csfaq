import { Router } from 'express';
import { updateProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.put('/me', authenticate, updateProfile);

export default router;
