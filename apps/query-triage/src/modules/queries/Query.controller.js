import { QueryService } from '../../services/Query.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Joi from 'joi';

// Validation schemas
const submitQuerySchema = Joi.object({
  idempotencyKey: Joi.string().optional().allow('', null),
  programId: Joi.string().required(),
  channel: Joi.string().valid('unified_intake', 'community', 'support', 'faq_search', 'ask_ai').default('unified_intake'),
  externalRef: Joi.object({
    type: Joi.string().valid('CommunityPost', 'SupportRequest', 'UnresolvedSearch'),
    id: Joi.string(),
  }).optional().allow(null),
  title: Joi.string().required().min(5).max(500),
  body: Joi.string().required().min(10).max(5000),
  attachments: Joi.array().items(Joi.object({
    fileId: Joi.string(),
    url: Joi.string().uri(),
    mimeType: Joi.string(),
    sizeBytes: Joi.number().positive(),
  })).optional().default([]),
  humanRequested: Joi.boolean().optional().default(false),
  humanRequestReason: Joi.string().max(500).optional().allow('', null),
  affectedUsers: Joi.string().valid('one', 'several', 'many', 'unknown').optional().default('one'),
  deadlineAt: Joi.string().isoDate().optional().allow('', null),
  userUrgencyReason: Joi.string().max(500).optional().allow('', null),
});

const requestHumanSchema = Joi.object({
  reason: Joi.string().required().min(10).max(500),
});

const closeCaseSchema = Joi.object({
  satisfied: Joi.boolean().required(),
  comment: Joi.string().max(1000).optional().allow('', null),
});

const updateQuerySchema = Joi.object({
  title: Joi.string().min(5).max(500).optional(),
  body: Joi.string().min(10).max(5000).optional(),
  attachments: Joi.array().items(Joi.object({
    fileId: Joi.string(),
    url: Joi.string().uri(),
    mimeType: Joi.string(),
    sizeBytes: Joi.number().positive(),
  })).optional(),
}).min(1);

/**
 * @route   POST /api/v1/queries
 * @desc    Submit a new query
 * @access  Private
 */
export const submitQuery = asyncHandler(async (req, res) => {
  const { error, value } = submitQuerySchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    throw ApiError.validationError(error.details.map(d => d.message));
  }

  const result = await QueryService.submitQuery(value, req.user);

  // Return 202 Accepted for async processing
  res.status(202).json(
    ApiResponse.accepted({
      queryId: result.queryCase._id,
      status: result.queryCase.status,
      decision: result.queryCase.decision,
      reasonCodes: result.queryCase.decisionReasons,
      priority: result.queryCase.priority,
      slaDueAt: result.queryCase.slaDueAt,
      canRequestHuman: true,
    }, 'Query submitted successfully and is being processed')
  );
});

/**
 * @route   GET /api/v1/queries/my-queries
 * @desc    Get current user's queries
 * @access  Private
 */
export const getMyQueries = asyncHandler(async (req, res) => {
  const { status, limit = 50, skip = 0 } = req.query;
  
  const result = await QueryService.getUserQueries(req.user._id?.toString(), {
    status,
    limit: parseInt(limit),
    skip: parseInt(skip),
  });

  res.status(200).json(
    ApiResponse.success(result, 'Queries retrieved successfully', 200)
  );
});

/**
 * @route   GET /api/v1/queries/:id
 * @desc    Get query details
 * @access  Private
 */
export const getQueryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const queryCase = await QueryService.getQueryById(id);
  
  // Check access - user can only see their own queries (admins and resolvers can see all)
  const userId = req.user._id?.toString();
  const adminRoles = ['super admin', 'system administrator', 'admin', 'resolver', 'super_admin', 'system_admin'];
  const userRole = (req.user.roleName || req.user.role?.name || req.user.role || '').toString().trim().toLowerCase();
  if (queryCase.userId !== userId && !adminRoles.includes(userRole)) {
    throw ApiError.forbidden('You do not have access to this query');
  }

  res.status(200).json(
    ApiResponse.success(queryCase, 'Query retrieved successfully')
  );
});

/**
 * @route   POST /api/v1/queries/:id/request-human
 * @desc    Request human intervention for a query
 * @access  Private
 */
export const requestHuman = asyncHandler(async (req, res) => {
  const { error, value } = requestHumanSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    throw ApiError.validationError(error.details.map(d => d.message));
  }

  const { id } = req.params;
  const userId = req.user._id?.toString();
  
  const queryCase = await QueryService.requestHuman(id, userId, value.reason);

  res.status(200).json(
    ApiResponse.success({
      queryId: queryCase._id,
      status: queryCase.status,
      priority: queryCase.priority,
      slaDueAt: queryCase.slaDueAt,
    }, 'Human assistance requested. Our team will respond within the SLA timeframe.')
  );
});

/**
 * @route   POST /api/v1/queries/:id/close
 * @desc    Close a resolved/answered query
 * @access  Private
 */
export const closeCase = asyncHandler(async (req, res) => {
  const { error, value } = closeCaseSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    throw ApiError.validationError(error.details.map(d => d.message));
  }

  const { id } = req.params;
  const userId = req.user._id?.toString();
  
  const queryCase = await QueryService.closeCase(id, userId, value);

  res.status(200).json(
    ApiResponse.success({
      queryId: queryCase._id,
      status: queryCase.status,
      userSatisfaction: queryCase.userSatisfaction,
    }, 'Query closed successfully')
  );
});

/**
 * @route   PATCH/PUT /api/v1/queries/:id
 * @desc    Update a query
 * @access  Private
 */
export const updateQuery = asyncHandler(async (req, res) => {
  const { error, value } = updateQuerySchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    throw ApiError.validationError(error.details.map(d => d.message));
  }

  const { id } = req.params;
  const userId = req.user._id?.toString();
  const userRole = (req.user.roleName || req.user.role?.name || req.user.role || '').toString().trim().toLowerCase();
  
  const queryCase = await QueryService.updateUserQuery(id, userId, value, userRole);

  res.status(200).json(
    ApiResponse.success(queryCase, 'Query updated successfully')
  );
});

/**
 * @route   DELETE /api/v1/queries/:id
 * @desc    Delete a query
 * @access  Private
 */
export const deleteQuery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id?.toString();
  const userRole = (req.user.roleName || req.user.role?.name || req.user.role || '').toString().trim().toLowerCase();
  
  await QueryService.deleteUserQuery(id, userId, userRole);

  res.status(200).json(
    ApiResponse.success(null, 'Query deleted successfully')
  );
});
