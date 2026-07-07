import QueryCase, { QueryStatus } from '../models/QueryCase.model.js';
import { ResolverCapacity, CapacitySnapshot } from '../models/CapacityStatus.model.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { CAPACITY_STATUS, EVENT_TYPES } from '../constants/triage.constants.js';
import { AuditService } from './Audit.service.js';

/**
 * Capacity Service - Workload Management and Overload Protection
 * 
 * Implements the SLA & Capacity Safeguards from product.md:
 * - 70% watch, 90% warning, 100% overload thresholds
 * - Per-resolver WIP limits
 * - Pull-based allocation
 */
export class CapacityService {
  /**
   * Get overall system capacity status
   */
  static async getSystemCapacity() {
    const activeCases = await QueryCase.countDocuments({
      status: { $in: [QueryStatus.AWAITING_HUMAN, QueryStatus.ASSIGNED] },
      isDeleted: false,
    });

    const resolvers = await ResolverCapacity.find({ status: { $ne: 'offline' } });
    const totalCapacity = resolvers.length * env.capacity.maxActiveCasesPerResolver;
    
    const capacityPercent = totalCapacity > 0 ? activeCases / totalCapacity : 0;
    
    let status;
    if (capacityPercent >= 1) {
      status = CAPACITY_STATUS.OVERLOAD;
    } else if (capacityPercent >= env.capacity.criticalThreshold) {
      status = CAPACITY_STATUS.WARNING;
    } else if (capacityPercent >= env.capacity.warningThreshold) {
      status = CAPACITY_STATUS.WATCH;
    } else {
      status = CAPACITY_STATUS.NORMAL;
    }

    return {
      activeCases,
      totalCapacity,
      activeResolvers: resolvers.length,
      capacityPercent,
      status,
      threshold: {
        warning: env.capacity.warningThreshold,
        critical: env.capacity.criticalThreshold,
      },
    };
  }

  /**
   * Get resolver capacity
   */
  static async getResolverCapacity(resolverId) {
    let capacity = await ResolverCapacity.findOne({ resolverId });
    
    if (!capacity) {
      capacity = await ResolverCapacity.create({
        resolverId,
        resolverName: resolverId,
        activeCases: 0,
        capacityPercent: 0,
        status: 'available',
      });
    }

    // Refresh active case count
    const activeCases = await QueryCase.countDocuments({
      assignedTo: resolverId,
      status: { $in: [QueryStatus.ASSIGNED, QueryStatus.WAITING_FOR_USER] },
      isDeleted: false,
    });

    const capacityPercent = activeCases / env.capacity.maxActiveCasesPerResolver;
    
    let status = 'available';
    if (capacityPercent >= 1) {
      status = 'overloaded';
    } else if (capacityPercent >= 0.7) {
      status = 'busy';
    }

    capacity.activeCases = activeCases;
    capacity.capacityPercent = capacityPercent;
    capacity.status = status;
    capacity.lastUpdated = new Date();
    await capacity.save();

    return capacity;
  }

  /**
   * Check if resolver can accept new cases
   */
  static async canAcceptCases(resolverId) {
    const capacity = await this.getResolverCapacity(resolverId);
    return capacity.activeCases < env.capacity.maxActiveCasesPerResolver;
  }

  /**
   * Get available resolvers (least loaded first - pull-based)
   */
  static async getAvailableResolvers(limit = 5) {
    const resolvers = await ResolverCapacity.find({
      status: { $ne: 'offline' },
      capacityPercent: { $lt: 1 },
    }).sort({ capacityPercent: 1 }).limit(limit);

    return resolvers;
  }

  /**
   * Record resolver activity/heartbeat
   */
  static async recordResolverActivity(resolverId, resolverName) {
    let capacity = await ResolverCapacity.findOne({ resolverId });
    
    if (!capacity) {
      capacity = await ResolverCapacity.create({
        resolverId,
        resolverName,
        activeCases: 0,
        capacityPercent: 0,
        status: 'available',
      });
    } else {
      capacity.lastUpdated = new Date();
      capacity.resolverName = resolverName || capacity.resolverName;
      await capacity.save();
    }

    return capacity;
  }

  /**
   * Mark resolver as offline
   */
  static async setResolverOffline(resolverId) {
    const capacity = await ResolverCapacity.findOne({ resolverId });
    if (capacity) {
      capacity.status = 'offline';
      await capacity.save();
    }
    return capacity;
  }

  /**
   * Take capacity snapshot for monitoring
   */
  static async takeCapacitySnapshot() {
    const systemCapacity = await this.getSystemCapacity();
    
    const breachedCases = await QueryCase.countDocuments({
      slaDueAt: { $lt: new Date() },
      status: { $in: [QueryStatus.AWAITING_HUMAN, QueryStatus.ASSIGNED] },
      isDeleted: false,
    });

    const snapshot = await CapacitySnapshot.create({
      totalActiveCases: systemCapacity.activeCases,
      totalResolvers: systemCapacity.activeResolvers,
      averageCapacityPercent: systemCapacity.capacityPercent,
      status: systemCapacity.status,
      breachedCases,
      details: {
        threshold: systemCapacity.threshold,
      },
    });

    // Log SLA warnings for breached cases
    if (breachedCases > 0) {
      logger.warn(`${breachedCases} cases have breached SLA`);
    }

    return snapshot;
  }

  /**
   * Get capacity trends
   */
  static async getCapacityTrends(hours = 24) {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const snapshots = await CapacitySnapshot.find({
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    return snapshots;
  }

  /**
   * Get WIP stats by resolver
   */
  static async getResolverWorkload() {
    const workloads = await QueryCase.aggregate([
      {
        $match: {
          status: { $in: [QueryStatus.ASSIGNED, QueryStatus.WAITING_FOR_USER] },
          isDeleted: false,
          assignedTo: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$assignedTo',
          activeCases: { $sum: 1 },
          waitingForUser: {
            $sum: { $cond: [{ $eq: ['$status', QueryStatus.WAITING_FOR_USER] }, 1, 0] },
          },
          priorityBreakdown: {
            $push: '$priority',
          },
        },
      },
      {
        $lookup: {
          from: 'resolvercapacities',
          localField: '_id',
          foreignField: 'resolverId',
          as: 'capacity',
        },
      },
      { $unwind: { path: '$capacity', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          resolverId: '$_id',
          resolverName: '$capacity.resolverName',
          activeCases: 1,
          waitingForUser: 1,
          capacityPercent: {
            $round: [
              { $multiply: [{ $divide: ['$activeCases', env.capacity.maxActiveCasesPerResolver] }, 100] },
              0,
            ],
          },
          canAcceptMore: {
            $lt: ['$activeCases', env.capacity.maxActiveCasesPerResolver],
          },
        },
      },
      { $sort: { activeCases: -1 } },
    ]);

    return workloads;
  }

  /**
   * Auto-cluster with adjusted threshold based on capacity
   */
  static getClusteringThreshold() {
    // Increase sensitivity when overloaded
    if (this.currentStatus === CAPACITY_STATUS.OVERLOAD) {
      return 0.85; // More aggressive clustering
    }
    if (this.currentStatus === CAPACITY_STATUS.WARNING) {
      return 0.87;
    }
    return env.thresholds.duplicateSimilarity;
  }
}

export default CapacityService;
