import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { Conversation } from '../ai/AI.model.js';
import { Bookmark } from '../chat/Chat.model.js';
import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import AuditLog from '../../models/AuditLog.js';

export const getMetrics = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    activeConversations,
    savedDocuments,
    bookmarkedAnswers,
    tokenAggregate
  ] = await Promise.all([
    Conversation.countDocuments({ user: userId, status: 'active' }),
    KnowledgeDocument.countDocuments({ uploadedBy: userId, isDeleted: false }),
    Bookmark.countDocuments({ user: userId }),
    Conversation.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$totalTokens' } } }
    ])
  ]);

  const totalTokens = tokenAggregate[0]?.total || 0;

  res.status(200).json({
    totalTokens,
    activeConversations,
    savedDocuments,
    bookmarkedAnswers
  });
});

export const getActivity = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [conversations, bookmarks, documents, auditLogs] = await Promise.all([
    Conversation.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Bookmark.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    KnowledgeDocument.find({ uploadedBy: userId }).sort({ createdAt: -1 }).limit(20).lean(),
    AuditLog.find({ user: userId }).sort({ createdAt: -1 }).limit(20).lean()
  ]);

  const feeds = [];

  // 1. Map conversations
  conversations.forEach(c => {
    feeds.push({
      _id: c._id.toString(),
      type: 'conversation',
      title: 'AI Conversation Started',
      description: c.title || 'New Chat Session',
      timestamp: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString()
    });
  });

  // 2. Map bookmarks
  bookmarks.forEach(b => {
    feeds.push({
      _id: b._id.toString(),
      type: 'bookmark',
      title: 'Answer Bookmarked',
      description: b.note || 'Bookmarked message from chat',
      timestamp: b.createdAt ? b.createdAt.toISOString() : new Date().toISOString()
    });
  });

  // 3. Map documents
  documents.forEach(d => {
    feeds.push({
      _id: d._id.toString(),
      type: 'upload',
      title: 'Document Uploaded',
      description: `${d.title} (${d.mimeType || 'unknown mimetype'})`,
      timestamp: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString()
    });
  });

  // 4. Map audit logs
  auditLogs.forEach(al => {
    let type = 'search';
    let title = 'System Event';
    if (al.action === 'auth.login') {
      type = 'bookmark';
      title = 'User Logged In';
    } else if (al.action === 'auth.logout') {
      type = 'bookmark';
      title = 'User Logged Out';
    } else if (al.action === 'auth.register') {
      type = 'bookmark';
      title = 'User Account Registered';
    }
    
    feeds.push({
      _id: al._id.toString(),
      type,
      title,
      description: `Action: ${al.action} from IP ${al.ipAddress || 'unknown'}`,
      timestamp: al.createdAt ? al.createdAt.toISOString() : new Date().toISOString()
    });
  });

  // Sort combined timeline by timestamp desc
  feeds.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.status(200).json(feeds.slice(0, 30));
});

export const getRecommendations = asyncHandler(async (req, res) => {
  // Grab 2 top completed Knowledge Documents for suggestions
  const docs = await KnowledgeDocument.find({ status: 'completed' }).limit(3).lean();
  const recommendations = docs.map((doc, idx) => ({
    _id: doc._id.toString(),
    type: 'document',
    title: doc.title,
    relevanceScore: 98 - idx * 4,
    summary: doc.description || 'Highly rated knowledge asset relevant to your role.'
  }));

  // Fallback if no documents exist in DB
  if (recommendations.length === 0) {
    recommendations.push({
      _id: 'default-rec-1',
      type: 'knowledge',
      title: 'Getting Started Guide',
      relevanceScore: 99,
      summary: 'Explore instructions on searching and bookmarking AI answers.'
    });
  }

  res.status(200).json(recommendations);
});

export const getCollections = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [docsCount, bookmarksCount, convsCount] = await Promise.all([
    KnowledgeDocument.countDocuments({ uploadedBy: userId, isDeleted: false }),
    Bookmark.countDocuments({ user: userId }),
    Conversation.countDocuments({ user: userId })
  ]);

  res.status(200).json([
    { id: 'docs', name: 'My Uploads', count: docsCount },
    { id: 'bookmarks', name: 'Saved Answers', count: bookmarksCount },
    { id: 'chats', name: 'AI Chats', count: convsCount }
  ]);
});

export const getUploads = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const docs = await KnowledgeDocument.find({ uploadedBy: userId, isDeleted: false }).sort({ createdAt: -1 }).limit(10).lean();
  res.status(200).json(docs);
});

export const getDownloads = asyncHandler(async (req, res) => {
  // Mock downloads or return empty
  res.status(200).json([]);
});
