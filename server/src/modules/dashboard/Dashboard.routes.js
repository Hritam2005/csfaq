import { Router } from 'express';
import {
  getMetrics,
  getActivity,
  getRecommendations,
  getCollections,
  getUploads,
  getDownloads
} from './Dashboard.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate); // Require authentication for all dashboard endpoints

router.get('/metrics', getMetrics);
router.get('/activity', getActivity);
router.get('/recommendations', getRecommendations);
router.get('/collections', getCollections);
router.get('/uploads', getUploads);
router.get('/downloads', getDownloads);

export default router;
