import { Router } from 'express';
import { getAllFaqs, getCategories, getFaqById, voteFaqHelpfulness } from '../controllers/faq.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Public access allowed for FAQ endpoints
router.get('/', getAllFaqs);
router.get('/categories', getCategories);
router.get('/:id', getFaqById);
router.post('/:id/vote', voteFaqHelpfulness);

export default router;
