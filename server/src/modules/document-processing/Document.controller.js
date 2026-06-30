import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { DocumentService } from './Document.service.js';
import KnowledgeDocument from '../../models/KnowledgeDocument.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  // Assuming multer has populated req.file
  if (!req.file) {
    return res.status(400).json(ApiResponse.error('No file provided'));
  }

  // Uses req.user._id set by authMiddleware
  const userId = req.user._id;

  const result = await DocumentService.processUpload(req.file, req.body, userId);
  
  // Notify via Socket.IO
  try {
    const { notificationService } = await import('../../notifications/Notification.service.js');
    notificationService.notifyAdmins({
      title: 'New Document Uploaded',
      message: `${req.file.originalname} uploaded by ${req.user.email}`,
      type: 'System Event',
      priority: 'low'
    });
  } catch (e) { /* ignore */ }

  res.status(201).json(ApiResponse.success(result, 'Upload processed'));
});

export const getDocuments = asyncHandler(async (req, res) => {
  const docs = await KnowledgeDocument.find({ isDeleted: false })
    .populate('uploadedBy', 'fullName')
    .sort({ createdAt: -1 });
    
  res.status(200).json(ApiResponse.success(docs, 'Documents fetched'));
});

export const getDocumentStatus = asyncHandler(async (req, res) => {
  const doc = await KnowledgeDocument.findById(req.params.id).select('status approvalStatus');
  if (!doc) {
    return res.status(404).json(ApiResponse.error('Document not found'));
  }
  res.status(200).json(ApiResponse.success(doc, 'Status fetched'));
});
