import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, getDocuments, getDocumentStatus } from './Document.controller.js';
import { authenticate, requirePermission } from '../../middlewares/auth.middleware.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, MD, and CSV are allowed.'));
    }
  }
});

const router = Router();

// Apply auth middleware to all document routes
router.use(authenticate);

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: Upload and process a new document
 *     tags: [Documents]
 */
router.post('/upload', requirePermission('document.upload'), upload.single('file'), uploadDocument);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: Get all documents
 *     tags: [Documents]
 */
router.get('/', requirePermission('document.read'), getDocuments);

/**
 * @swagger
 * /documents/{id}/status:
 *   get:
 *     summary: Get processing status of a document
 *     tags: [Documents]
 */
router.get('/:id/status', requirePermission('document.read'), getDocumentStatus);

export default router;
