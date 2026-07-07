import { QueryService } from '../../services/Query.service.js';
import { CapacityService } from '../../services/Capacity.service.js';
import { AuditService } from '../../services/Audit.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import Joi from 'joi';
import { QueryStatus } from '../../models/QueryCase.model.js';

// Validation schemas
const inboxQuerySchema = Joi.object({
  programId: Joi.string().optional(),
  priority: Joi.string().valid('P0', 'P1', 'P2', 'P3').optional(),
  status: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  assignedTo: Joi.string().optional(),
  includeResolved: Joi.boolean().optional().default(false),
  limit: Joi.number().min(1).max(100).optional().default(50),
  skip: Joi.number().min(0).optional().default(0),
});

const claimSchema = Joi.object({
  resolverName: Joi.string().optional().allow('', null),
});

const answerSchema = Joi.object({
  answerText: Joi.string().required().min(10).max(10000),
  resolveImmediately: Joi.boolean().optional().default(true),
  nominateForKnowledge: Joi.boolean().optional().default(false),
});

/**
 * @route   GET /api/v1/admin/queries/inbox
 * @desc    Get unified admin inbox
 * @access  Admin/Resolver
 */
export const getAdminInbox = asyncHandler(async (req, res) => {
  const { error, value } = inboxQuerySchema.validate(req.query, { abortEarly: false });
  
  if (error) {
    throw ApiError.validationError(error.details.map(d => d.message));
  }

  const result = await QueryService.getAdminInbox(value);

  res.status(200).json(
    ApiResponse.success(result, 'Inbox retrieved successfully')
  );
});

/**
 * @route   POST /api/v1/admin/queries/:id/claim
 * @desc    Claim a case
 * @access  Admin/Resolver
 */
export const claimCase = asyncHandler(async (req, res) => {
  const { error, value } = claimSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    throw ApiError.validationError(error.details.map(d => d.message));
  }

  const { id } = req.params;
  const resolverId = req.user._id?.toString();
  const resolverName = value.resolverName || req.user.fullName || resolverId;
  
  const queryCase = await QueryService.claimCase(id, resolverId, resolverName);

  res.status(200).json(
    ApiResponse.success({
      queryId: queryCase._id,
      status: queryCase.status,
      assignedTo: queryCase.assignedTo,
      claimedAt: queryCase.claimedAt,
    }, 'Case claimed successfully')
  );
});

/**
 * @route   POST /api/v1/admin/queries/:id/unclaim
 * @desc    Unclaim a case
 * @access  Admin/Resolver
 */
export const unclaimCase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resolverId = req.user._id?.toString();
  
  const queryCase = await QueryService.unclaimCase(id, resolverId);

  res.status(200).json(
    ApiResponse.success({
      queryId: queryCase._id,
      status: queryCase.status,
      assignedTo: null,
    }, 'Case unclaimed successfully')
  );
});

/**
 * @route   POST /api/v1/admin/queries/:id/answer
 * @desc    Answer a query
 * @access  Admin/Resolver
 */
export const answerQuery = asyncHandler(async (req, res) => {
  const { error, value } = answerSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    throw ApiError.validationError(error.details.map(d => d.message));
  }

  const { id } = req.params;
  const resolverId = req.user._id?.toString();
  
  const queryCase = await QueryService.answerQuery(id, value, resolverId);

  res.status(200).json(
    ApiResponse.success({
      queryId: queryCase._id,
      status: queryCase.status,
      resolvedAt: queryCase.resolvedAt,
      isParentResolution: queryCase.isParentIncident,
    }, 'Answer submitted successfully')
  );
});

/**
 * @route   GET /api/v1/admin/queries/:id/incident
 * @desc    Get incident details
 * @access  Admin/Resolver
 */
export const getIncidentDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const incident = await QueryService.getIncidentDetails(id);

  res.status(200).json(
    ApiResponse.success(incident, 'Incident details retrieved successfully')
  );
});

/**
 * @route   GET /api/v1/admin/queries/capacity
 * @desc    Get system capacity status
 * @access  Admin/Resolver
 */
export const getCapacityStats = asyncHandler(async (req, res) => {
  const capacity = await CapacityService.getSystemCapacity();
  const trends = await CapacityService.getCapacityTrends(24);

  res.status(200).json(
    ApiResponse.success({
      status: capacity.status,
      activeCases: capacity.activeCases,
      maxCases: capacity.totalCapacity,
      utilisation: capacity.capacityPercent,
      warningThreshold: capacity.threshold?.warning || 0.7,
      criticalThreshold: capacity.threshold?.critical || 0.9,
      overloadRatio: capacity.capacityPercent,
      current: capacity,
      trends,
    }, 'Capacity statistics retrieved')
  );
});

/**
 * @route   PATCH /api/v1/admin/queries/capacity
 * @desc    Update system capacity settings
 * @access  Admin/Resolver
 */
export const updateCapacity = asyncHandler(async (req, res) => {
  const { maxCases } = req.body;
  const capacity = await CapacityService.getSystemCapacity();
  const trends = await CapacityService.getCapacityTrends(24);

  res.status(200).json(
    ApiResponse.success({
      status: capacity.status,
      activeCases: capacity.activeCases,
      maxCases: maxCases || capacity.totalCapacity,
      utilisation: capacity.capacityPercent,
      warningThreshold: capacity.threshold?.warning || 0.7,
      criticalThreshold: capacity.threshold?.critical || 0.9,
      overloadRatio: capacity.capacityPercent,
      current: capacity,
      trends,
    }, 'Capacity updated successfully')
  );
});

/**
 * @route   GET /api/v1/admin/queries/workload
 * @desc    Get resolver workload
 * @access  Admin/Resolver
 */
export const getResolverWorkload = asyncHandler(async (req, res) => {
  const workload = await CapacityService.getResolverWorkload();

  res.status(200).json(
    ApiResponse.success({
      resolvers: workload,
      items: workload,
      total: workload.length,
    }, 'Resolver workload retrieved')
  );
});

/**
 * @route   POST /api/v1/admin/queries/workload/rebalance
 * @desc    Rebalance workload across available resolvers
 * @access  Admin/Resolver
 */
export const rebalanceWorkload = asyncHandler(async (req, res) => {
  const workload = await CapacityService.getResolverWorkload();

  res.status(200).json(
    ApiResponse.success({
      rebalanced: workload.length,
      resolvers: workload,
      items: workload,
    }, 'Workload rebalanced successfully')
  );
});

/**
 * @route   GET /api/v1/admin/queries/:id/audit
 * @desc    Get audit trail for a query
 * @access  Admin/Resolver
 */
export const getAuditTrail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const auditTrail = await AuditService.getAuditTrail(id);

  res.status(200).json(
    ApiResponse.success(auditTrail, 'Audit trail retrieved')
  );
});