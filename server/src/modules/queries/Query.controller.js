import Query from './Query.model.js';
import { logger } from '../../config/logger.js';
import ApiError from '../../utils/ApiError.js';

const determinePriority = (question) => {
  const text = question.toLowerCase();
  const highKeywords = [
    'urgent', 'asap', 'emergency', 'broken', 'critical',
    'crash', 'blocker', 'blocking', 'cannot login',
    'login issue', 'error 500', 'fatal'
  ];
  const mediumKeywords = [
    'bug', 'help', 'issue', 'incorrect', 'wrong',
    'missing', 'delay', 'slow', 'unable to', 'fail'
  ];

  if (highKeywords.some(kw => text.includes(kw))) {
    return 'High';
  }
  if (mediumKeywords.some(kw => text.includes(kw))) {
    return 'Medium';
  }
  return 'Low';
};

export const submitQuery = async (req, res, next) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      throw new ApiError(400, 'Question is required');
    }

    const priority = determinePriority(question);

    const query = await Query.create({
      user: req.user._id,
      question,
      priority
    });

    res.status(201).json({
      success: true,
      data: query,
      message: 'Query submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getMyQueries = async (req, res, next) => {
  try {
    const queries = await Query.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: queries
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQueries = async (req, res, next) => {
  try {
    const queries = await Query.find().populate('user', 'fullName email').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: queries
    });
  } catch (error) {
    next(error);
  }
};

export const resolveQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;
    
    const query = await Query.findByIdAndUpdate(
      id,
      {
        response,
        status: status || 'Resolved',
        resolvedBy: req.user._id
      },
      { new: true, runValidators: true }
    );

    if (!query) {
      throw new ApiError(404, 'Query not found');
    }

    try {
      const { notificationService } = await import('../notifications/Notification.service.js');
      await notificationService.notifyUser(query.user.toString(), {
        title: 'Query Resolved',
        message: `Your question has been resolved: ${response.substring(0, 50)}...`,
        type: 'query_update'
      });
    } catch (socketErr) {
      logger.error('Failed to send notification:', socketErr);
    }

    res.status(200).json({
      success: true,
      data: query,
      message: 'Query resolved successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = await Query.findByIdAndDelete(id);

    if (!query) {
      throw new ApiError(404, 'Query not found');
    }

    res.status(200).json({
      success: true,
      message: 'Query deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
